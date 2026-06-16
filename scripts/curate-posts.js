// 既存記事を「厳選」して低品質な薄い記事を posts_archive/ へ退避する。
// AdSense「有用性の低いコンテンツ」対策（2026-06-16）。
//
// 使い方:
//   node scripts/curate-posts.js            # ドライラン（何も変更しない・結果だけ表示）
//   node scripts/curate-posts.js --apply    # 実際に退避を実行
//   オプション: --keep=55  残す本数（デフォルト55）
//
// スコアリング: 本文の長さ・構造の豊かさ・本物の画像(OGP)の有無で採点し、上位を残す。
// 退避はファイルの「移動」なので posts_archive/ から戻せば復元可能。

const fs = require('fs')
const path = require('path')

const POSTS_DIR = path.join(__dirname, '..', 'posts')
const ARCHIVE_DIR = path.join(__dirname, '..', 'posts_archive')

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const keepArg = args.find(a => a.startsWith('--keep='))
const KEEP = keepArg ? parseInt(keepArg.split('=')[1]) : 55

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function isRealImage(url) {
  return !!url && !url.includes('loremflickr')
}

// ツール・SaaS関連の記事か（このサイトのテーマ）を判定するためのシグナル
const ON_TOPIC = /ツール|アプリ|SaaS|ソフト|プラットフォーム|サービス|機能|自動化|生成AI|AI|API|プラグイン|拡張機能|ノーコード|tool|app|software|platform|plugin|automation/i
// このサイトと無関係な一般ニュース（エンタメ・株価・政治・医療など）
const OFF_TOPIC = /映画|ドラマ|Netflix|株価|決算|裁判|訴訟|選挙|政権|腫瘍|がん|ワクチン|スポーツ|アニメ化|公開延期|配達|宅配|デリバリー|ホテル|パスポート|宇宙|兵器|ペンタゴン|軍事|電気自動車|EV新|ゲーム業界|movie|film|lawsuit|election|stock|delivery|passport|weapon|military/i

function scorePost(post) {
  const text = stripHtml(post.content)
  const hay = `${post.title} ${text}`
  let score = text.length // 本文が長いほど＝中身がある

  if (isRealImage(post.imageUrl)) score += 400      // 記事固有の本物の画像
  if (/<table/i.test(post.content)) score += 200    // 比較表など構造化された情報
  const liCount = (post.content.match(/<li/gi) || []).length
  score += Math.min(liCount, 8) * 30
  const h2Count = (post.content.match(/<h2/gi) || []).length
  score += h2Count * 50

  // テーマ適合度: ツール系は加点、無関係な一般ニュースは大きく減点
  if (ON_TOPIC.test(hay)) score += 800
  if (OFF_TOPIC.test(hay)) score -= 1500

  // タイトル生成が壊れている記事（AIがタイトルでなく解説文/メタ発言を返したもの）は大きく減点
  const title = post.title || ''
  if (/タイトル[：:]|重視した|親しみやす|を扱った|内容ですね|\n/.test(title) || title.length > 38) {
    score -= 2000
  }

  return score
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('posts/ が見つかりません')
    process.exit(1)
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'))
  const scored = files.map(f => {
    const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8'))
    return { file: f, post, score: scorePost(post), len: stripHtml(post.content).length }
  })

  scored.sort((a, b) => b.score - a.score)

  const keep = scored.slice(0, KEEP)
  const archive = scored.slice(KEEP)

  console.log(`📊 総記事数: ${scored.length}`)
  console.log(`✅ 残す: ${keep.length}  📦 退避: ${archive.length}  (keep=${KEEP})`)
  const realImgKeep = keep.filter(s => isRealImage(s.post.imageUrl)).length
  console.log(`   残す記事のうち本物の画像あり: ${realImgKeep} / ${keep.length}`)
  console.log('─'.repeat(60))
  console.log('退避する記事（スコア下位）の例:')
  archive.slice(0, 10).forEach(s => {
    console.log(`  [score ${String(s.score).padStart(5)}] ${s.post.title.slice(0, 40)}`)
  })

  if (!APPLY) {
    console.log('\n（ドライラン。実行するには --apply を付けてください）')
    return
  }

  if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true })
  let moved = 0
  for (const s of archive) {
    fs.renameSync(path.join(POSTS_DIR, s.file), path.join(ARCHIVE_DIR, s.file))
    moved++
  }
  console.log(`\n📦 ${moved}件を posts_archive/ へ退避しました。`)
  console.log(`✅ posts/ に残った記事: ${fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json')).length}件`)
}

main()
