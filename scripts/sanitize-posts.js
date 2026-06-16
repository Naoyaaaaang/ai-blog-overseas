require('dotenv').config({ path: '.env.local' })

// posts/ に残った記事を「編集部の解説記事」として安全に書き直す。
// - 体験を装う表現（使ってみた/触ってみた/3日使った 等）を除去
// - 出典不明な料金・数値の断定を和らげる
// - 構造・長さ・装飾はできるだけ保持
// - loremflickr のランダム画像は null 化（描画側がブランドプレースホルダーを表示）
//
// 使い方:
//   node scripts/sanitize-posts.js            # ドライラン（対象件数と画像修正のみ表示）
//   node scripts/sanitize-posts.js --apply    # API で本文を書き直し＋画像修正を保存
//   オプション: --from=N --to=M  （1始まりの範囲指定）

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')

const POSTS_DIR = path.join(__dirname, '..', 'posts')
const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const fromArg = args.find(a => a.startsWith('--from='))
const toArg = args.find(a => a.startsWith('--to='))
const FROM = fromArg ? parseInt(fromArg.split('=')[1]) - 1 : 0
const TO = toArg ? parseInt(toArg.split('=')[1]) : Infinity

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function stripCodeFences(text) {
  return text.replace(/^```[\w]*\r?\n?/, '').replace(/\r?\n?```\s*$/, '').trim()
}

function buildSanitizePrompt(content) {
  return `以下は既存のブログ記事HTMLです。これを「編集部が海外メディアの報道をもとにまとめた解説記事」として書き直してください。情報・構成・見出しの数・おおよその長さは保ちつつ、以下の問題だけを取り除きます。

【元記事HTML】
${content}

【必ず直すこと】
1. 実際に使った体験を装う表現を全て書き換える（「使ってみた」「触ってみた」「試してみた」「3日使った」「自分が最初に驚いたのは」「自分だったら」など一人称の体験談）→「ソースによると」「〜と報じられている」「〜とみられる」など、公開情報・分析ベースの編集部の解説調へ
2. 出典が不明な具体的な料金・数値・対応言語・機能の断定は和らげる（例:「月額$9〜」→「料金は公式サイトで要確認」、「30言語以上に対応」など断定が怪しいものは「対応範囲は公式情報を確認」等）。確実に一般的な事実は残してよい
3. 宣伝口調（「〜を実現します」「〜を提供しています」）や「革新的」「画期的」「革命的」を除去

【保つこと】
- HTML構造（h2/h3/p/ul/table/divの装飾ボックス）と見出しの数、記事の長さ、絵文字や色付けの雰囲気
- ツール名・テーマ・事実関係
- 末尾の参照元リンク（aタグ）があれば残す

HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）。`
}

async function sanitizeContent(content) {
  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    messages: [{ role: 'user', content: buildSanitizePrompt(content) }],
  })
  return res.content[0].type === 'text' ? stripCodeFences(res.content[0].text) : content
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildTitlePrompt(contentText) {
  return `以下は海外ツール・SaaSを紹介する解説記事の本文です。この記事にふさわしい日本語タイトルを1つだけ作ってください。

【本文（抜粋）】
${contentText.slice(0, 500)}

【ルール】
- 28文字以内、タイトルのみを出力（説明や前置き・記号囲みは一切不要）
- 内容を正確に表す、誇張のない自然なタイトル
- 「【衝撃】」「ヤバい」「え、何これ？」などの煽り表現は使わない
- 「使ってみた」「3ヶ月使い続けた」「正直レビュー」など、実際に使った体験を装う表現は使わない
- 記事のテーマ（ツール名やできること）が伝わるようにする`
}

async function regenerateTitle(contentText, fallback) {
  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 60,
    messages: [{ role: 'user', content: buildTitlePrompt(contentText) }],
  })
  const t = res.content[0].type === 'text' ? res.content[0].text.trim().replace(/^["「『]|["」』]$/g, '').trim() : ''
  // 失敗・破損（空・長すぎ・改行・メタ発言）時は元タイトルを維持
  if (!t || t.length > 40 || /\n|タイトル[：:]|です。|ます。/.test(t)) return fallback
  return t
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json')).sort()
  const targets = files.slice(FROM, TO)

  console.log(`📂 対象: ${targets.length}件 (全${files.length}件中 ${FROM + 1}〜${Math.min(FROM + targets.length, files.length)})`)
  if (!APPLY) {
    const fab = targets.filter(f => /使ってみた|触ってみた|試してみた|3日使|自分が最初に|自分だったら/.test(
      fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8'))).length
    const img = targets.filter(f => fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8').includes('loremflickr')).length
    console.log(`  体験偽装フレーズを含む記事: ${fab}件 / ランダム画像の記事: ${img}件`)
    console.log('（ドライラン。実行するには --apply を付けてください）')
    return
  }

  let ok = 0, fail = 0, imgFixed = 0
  for (let i = 0; i < targets.length; i++) {
    const file = targets[i]
    const filePath = path.join(POSTS_DIR, file)
    const post = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    process.stdout.write(`[${i + 1}/${targets.length}] ${post.title.slice(0, 32)} ... `)

    // ランダム画像は null 化（ブランドプレースホルダーに）
    if (post.imageUrl && post.imageUrl.includes('loremflickr')) {
      post.imageUrl = null
      imgFixed++
    }

    try {
      post.content = await sanitizeContent(post.content)
      post.title = await regenerateTitle(stripHtml(post.content), post.title)
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8')
      console.log(`✅ ${post.title.slice(0, 30)}`)
      ok++
    } catch (e) {
      // API失敗でも画像修正だけは保存
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8')
      console.log(`❌ ${e.message}`)
      fail++
    }
    await new Promise(r => setTimeout(r, 700))
  }

  console.log('─'.repeat(50))
  console.log(`🎉 完了！ 書き換え成功: ${ok} / 失敗: ${fail} / 画像null化: ${imgFixed}`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
