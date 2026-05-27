require('dotenv').config({ path: '.env.local' })

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')
const siteConfigs = require('./site-configs')

const SITE_ID = process.env.SITE_ID || 'ai-news'
const siteConfig = siteConfigs[SITE_ID]
if (!siteConfig) {
  console.error(`❌ Unknown SITE_ID: "${SITE_ID}"`)
  process.exit(1)
}
console.log(`📌 サイト: ${SITE_ID}`)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const POSTS_DIR = path.join(__dirname, '..', 'posts')

const STYLE_CONFIGS = {
  'ai-news': {
    accent: '#e74c3c', accentName: '赤',
    data: '#2980b9', dataName: '青',
    box1bg: '#e8f4fd', box1border: '#3498db', box1label: '注目ポイント',
    box2bg: '#fff8e1', box2border: '#f39c12', box2label: '補足',
    h3color: '#27ae60',
    tableHeader: '#3498db',
  },
  'crypto-news': {
    accent: '#e74c3c', accentName: '赤',
    data: '#f39c12', dataName: '金色',
    box1bg: '#fff8e1', box1border: '#f39c12', box1label: '注目',
    box2bg: '#fdf2f8', box2border: '#e91e8c', box2label: '⚠️ リスク・注意',
    h3color: '#f39c12',
    tableHeader: '#2c3e50',
  },
  'nisa-blog': {
    accent: '#c0392b', accentName: '赤',
    data: '#27ae60', dataName: '緑',
    box1bg: '#e8f8f5', box1border: '#27ae60', box1label: 'ポイント',
    box2bg: '#fff8e1', box2border: '#f39c12', box2label: '⚠️ 注意・リスク',
    h3color: '#27ae60',
    tableHeader: '#27ae60',
  },
  'ai-image': {
    accent: '#8e44ad', accentName: '紫',
    data: '#e74c3c', dataName: '赤',
    box1bg: '#f3e5f5', box1border: '#8e44ad', box1label: '試してみてポイント',
    box2bg: '#e8f4fd', box2border: '#3498db', box2label: '💡 TIPS',
    h3color: '#8e44ad',
    tableHeader: '#8e44ad',
  },
  'overseas-tools': {
    accent: '#e74c3c', accentName: '赤',
    data: '#2980b9', dataName: '青',
    box1bg: '#e8f4fd', box1border: '#3498db', box1label: '📌 ポイント',
    box2bg: '#fff8e1', box2border: '#f39c12', box2label: '⚠️ 注意点',
    h3color: '#27ae60',
    tableHeader: '#3498db',
  },
}

const style = STYLE_CONFIGS[SITE_ID] || STYLE_CONFIGS['ai-news']

function buildPrompt(content) {
  return `以下のHTML記事を、読みやすくリッチなフォーマットに書き直してください。内容・情報・事実はそのまま保持し、装飾とレイアウトだけを強化します。

【現在の記事HTML】
${content}

【変換ルール】
1. 重要キーワード・固有名詞は <span style="color:${style.accent};font-weight:bold;">〜</span> で強調
2. 数値・データ・金額は <span style="color:${style.data};font-weight:bold;">〜</span> で強調
3. h2タグに style="font-size:1.3em;" を追加し、内容に合った絵文字を先頭に1つ付ける（例: 🔧 🚀 💡 📊 🎯 💰 🌍 ⚡ 🛠️ 📱 🤖 👀 など。見出しの意味に合ったものを選ぶ）
4. h3タグに style="color:${style.h3color};" を追加
5. 重要な段落や要点を以下のボックスで囲む（記事中に1〜2箇所）:
   <div style="background:${style.box1bg};border-left:4px solid ${style.box1border};padding:14px 18px;margin:20px 0;border-radius:6px;"><strong>${style.box1label}:</strong> 〜</div>
6. 注意・補足がある場合は:
   <div style="background:${style.box2bg};border-left:4px solid ${style.box2border};padding:14px 18px;margin:20px 0;border-radius:6px;">${style.box2label}: 〜</div>
7. 比較・仕様・料金などがあればtableタグで表形式に（ヘッダー行: background:${style.tableHeader};color:#fff;）
8. <strong>タグで重要フレーズを太字に（各段落1〜2箇所）
9. ulタグのリスト項目（liタグ）には、内容に合った絵文字を先頭に付ける（✅ ❌ 💬 📌 🔹 ⚠️ など）

【重要】
- 文章の内容・事実・情報は変えないこと
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）
- 元の記事の構成・見出しの数は維持する`
}

function isAlreadyFormatted(content) {
  // インラインスタイルが既に多く含まれていたらスキップ
  const styleCount = (content.match(/style="/g) || []).length
  return styleCount >= 5
}

async function reformatPost(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const post = JSON.parse(raw)

  if (isAlreadyFormatted(post.content)) {
    return false // スキップ
  }

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role: 'user', content: buildPrompt(post.content) }],
  })

  const newContent = response.content[0].type === 'text'
    ? response.content[0].text.replace(/^```[\w]*\r?\n?/, '').replace(/\r?\n?```\s*$/, '').trim()
    : post.content

  post.content = newContent
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8')
  return true
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'))
  console.log(`📂 対象: ${files.length}件`)

  let updated = 0
  let skipped = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = path.join(POSTS_DIR, file)
    process.stdout.write(`[${i + 1}/${files.length}] ${file} ... `)

    try {
      const result = await reformatPost(filePath)
      if (result) {
        console.log('✅ 更新')
        updated++
      } else {
        console.log('⏭ スキップ（既にフォーマット済み）')
        skipped++
      }
      await new Promise(r => setTimeout(r, 600))
    } catch (e) {
      console.log(`❌ エラー: ${e.message}`)
    }
  }

  console.log(`\n🎉 完了！ 更新: ${updated}件 / スキップ: ${skipped}件`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
