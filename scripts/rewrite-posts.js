require('dotenv').config({ path: '.env.local' })

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')
const siteConfigs = require('./site-configs')

const SITE_ID = process.env.SITE_ID || 'overseas-tools'
const siteConfig = siteConfigs[SITE_ID]
if (!siteConfig) {
  console.error(`❌ Unknown SITE_ID: "${SITE_ID}"`)
  process.exit(1)
}
console.log(`📌 サイト: ${SITE_ID}`)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const POSTS_DIR = path.join(__dirname, '..', 'posts')

// コマンドライン引数で --from=N --to=M の範囲指定に対応
const args = process.argv.slice(2)
const fromArg = args.find(a => a.startsWith('--from='))
const toArg = args.find(a => a.startsWith('--to='))
const FROM = fromArg ? parseInt(fromArg.split('=')[1]) - 1 : 0
const TO = toArg ? parseInt(toArg.split('=')[1]) : Infinity

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function stripCodeFences(text) {
  return text
    .replace(/^```[\w]*\r?\n?/, '')
    .replace(/\r?\n?```\s*$/, '')
    .trim()
}

async function rewritePost(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const post = JSON.parse(raw)

  const item = {
    title: post.title,
    source: post.source,
    link: post.sourceUrl || '',
    summary: stripHtml(post.content).slice(0, 300),
  }

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role: 'user', content: siteConfig.contentPrompt(item) }],
  })

  const newContent = response.content[0].type === 'text'
    ? stripCodeFences(response.content[0].text)
    : post.content

  post.content = newContent
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8')
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()

  const targets = files.slice(FROM, TO)
  console.log(`📂 対象: ${targets.length}件 (${FROM + 1}〜${Math.min(FROM + targets.length, files.length)}件目)`)
  console.log('─'.repeat(50))

  let updated = 0
  let failed = 0

  for (let i = 0; i < targets.length; i++) {
    const file = targets[i]
    const filePath = path.join(POSTS_DIR, file)
    process.stdout.write(`[${i + 1}/${targets.length}] ${file} ... `)

    try {
      await rewritePost(filePath)
      console.log('✅ 完了')
      updated++
    } catch (e) {
      console.log(`❌ エラー: ${e.message}`)
      failed++
    }

    await new Promise(r => setTimeout(r, 800))
  }

  console.log('─'.repeat(50))
  console.log(`🎉 完了！ 更新: ${updated}件 / 失敗: ${failed}件`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
