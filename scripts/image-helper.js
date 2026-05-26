const TAG_TO_KEYWORD = {
  'AI': 'technology',
  'テクノロジー': 'technology',
  '仮想通貨': 'cryptocurrency',
  'ビットコイン': 'bitcoin',
  'イーサリアム': 'ethereum',
  'ブロックチェーン': 'blockchain',
  '投資': 'investment',
  'NISA': 'finance',
  '株式': 'stock',
  '経済': 'economy',
  'AI画像': 'art',
  '画像生成': 'art',
  'ツール': 'software',
  '海外ツール': 'software',
  'スタートアップ': 'startup',
  'セキュリティ': 'security',
  'ロボット': 'robot',
  'ゲーム': 'gaming',
}

const SITE_DEFAULTS = {
  'ai-news': 'technology',
  'crypto-news': 'cryptocurrency',
  'nisa-blog': 'finance',
  'ai-image': 'art',
  'overseas-tools': 'software',
}

function getKeyword(tags, siteId) {
  const mapped = (tags || []).map(t => TAG_TO_KEYWORD[t]).filter(Boolean)
  return mapped[0] || SITE_DEFAULTS[siteId] || 'technology'
}

function lockFromSlug(slug) {
  const digits = (slug || '').replace(/\D/g, '')
  return digits.length > 4 ? parseInt(digits.slice(-4)) : Math.floor(Math.random() * 1000)
}

function loremflickrUrl(tags, siteId, slug) {
  const keyword = getKeyword(tags, siteId)
  const lock = lockFromSlug(slug)
  return `https://loremflickr.com/1200/630/${keyword}?lock=${lock}`
}

// 記事URLからOGP画像を取得する（失敗時はnullを返す）
async function fetchOgpImage(url) {
  if (!url) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ToolHunterBot/1.0)' },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/<meta[^>]+(?:property="og:image"|name="twitter:image")[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:image"|name="twitter:image")/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function fetchUnsplashUrl(tags, siteId, slug, sourceUrl) {
  // まずRSSの記事URLからOGP画像を取得を試みる
  const ogp = await fetchOgpImage(sourceUrl)
  if (ogp) return ogp
  // フォールバックはloremflickr
  return loremflickrUrl(tags, siteId, slug)
}

module.exports = { fetchUnsplashUrl }
