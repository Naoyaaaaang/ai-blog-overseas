const siteConfigs = {
  'ai-news': {
    rssSources: [
      { url: 'https://openai.com/blog/rss.xml', name: 'OpenAI' },
      { url: 'https://blog.google/technology/ai/rss/', name: 'Google AI' },
      { url: 'https://huggingface.co/blog/feed.xml', name: 'Hugging Face' },
      { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI' },
      { url: 'https://venturebeat.com/category/ai/feed/', name: 'VentureBeat AI' },
    ],
    tags: (source) => ['AI', 'テクノロジー', source],
    contentPrompt: (item) => `以下の海外AIニュースをもとに、日本語のブログ記事をHTMLで書いてください。

ソース: ${item.source}
タイトル: ${item.title}
概要: ${item.summary}
URL: ${item.link}

条件:
- h2タグで見出し（2〜3個）
- pタグで本文
- 最後に参照元リンク
- 800〜1000字
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）

文体・トーン:
- テック系ニュースを追いかけているブロガーが「これどう思う？」と友人に話すような、砕けた報道口調
- 具体的な数値やデータを積極的に使う（「〜億パラメータ」「〜%高速化」「〜ドル調達」など）
- 「個人的にはこの点が気になった」「正直、まだ懐疑的な部分もある」という自分の視点を1箇所入れる
- 競合・業界への影響についても触れる。ただし断定しすぎない（「〜になりそう」「〜かもしれない」）
- 見出しの形式は毎回変える。疑問形・断言・驚き系など混ぜる

絶対に使わないこと:
- 「革新的」「画期的」「革命的」「トレンド」
- 「〜を実現します」「〜を提供しています」「〜を解決します」
- 「注目が集まっています」「注目されています」
- 毎回同じパターンの書き出し・締め`,
    titlePrompt: (title) => `以下を日本語のブログタイトルに変換してください。30文字以内、タイトルのみ出力。
テックニュースを追っている人が「ん、これ何？」と思わずクリックしてしまうようなタイトルで。煽りすぎず、でも引きは作って。

${title}`,
  },

  'crypto-news': {
    rssSources: [
      { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk' },
      { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' },
      { url: 'https://decrypt.co/feed', name: 'Decrypt' },
      { url: 'https://bitcoinmagazine.com/feed', name: 'Bitcoin' },
      { url: 'https://thedefiant.io/feed', name: 'DeFi' },
    ],
    tags: (source) => ['仮想通貨', '暗号資産', source],
    contentPrompt: (item) => `以下の海外仮想通貨ニュースをもとに、日本語のブログ記事をHTMLで書いてください。

ソース: ${item.source}
タイトル: ${item.title}
概要: ${item.summary}
URL: ${item.link}

条件:
- h2タグで見出し（2〜3個）
- pタグで本文
- 最後に参照元リンク
- 800〜1000字
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）

文体・トーン:
- 仮想通貨を実際に持っている人間が、友達のDiscordで「これどう思う？」と話すようなリアルな口調
- 「要するにこういうことだよな」という咀嚼コメントを必ず1つ入れる
- 強気に見える材料・弱気に見える材料を両方書いて、どちらとも断定しない
- 「投資は自己責任で」は自然な文脈で1回だけ入れる（最後にまとめとして入れない）
- HODL・DeFiなどの用語はそのまま使い、初見の人向けに括弧で一言補足

絶対に使わないこと:
- 「革新的」「画期的」「革命的」「トレンド」「注目を集めています」
- 「〜を実現します」「〜を提供しています」「〜により〜が可能になります」
- 毎回同じパターンの書き出し（「〜が話題になっています」「〜が発表されました」の書き出し厳禁）
- 「まとめると」で始まる締め段落`,
    titlePrompt: (title) => `以下を日本語のブログタイトルに変換してください。30文字以内、タイトルのみ出力。
仮想通貨クラスタが「え、マジ？」となるようなノリで。煽りすぎは不要、界隈らしさを自然に出して。

${title}`,
  },

  'nisa-blog': {
    rssSources: [
      { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', name: 'MarketWatch' },
      { url: 'https://www.investing.com/rss/news.rss', name: 'Investing.com' },
      { url: 'https://news.yahoo.co.jp/rss/topics/business.xml', name: 'Yahoo経済' },
      { url: 'https://toyokeizai.net/list/feed/rss?category=money', name: '東洋経済マネー' },
      { url: 'https://cryptonews.com/news/feed/', name: '金融ニュース' },
    ],
    filterKeywords: [
      '投資', 'NISA', '積立', 'ETF', '投資信託', '資産運用', '配当', 'ファンド', 'iDeCo', '金利', '円安', '為替', '日経平均', '米国株', 'S&P', '節税', '株価', '証券', '利回り',
      'stock', 'invest', 'market', 'fund', 'dividend', 'bond', 'yield', 'Fed', 'rate', 'finance', 'retire', 'portfolio', 'Dow', 'Nasdaq', 'rally', 'inflation',
    ],
    tags: (source) => ['NISA', '投資', source],
    contentPrompt: (item) => `以下の投資・NISA関連ニュースをもとに、日本語のブログ記事をHTMLで書いてください。

ソース: ${item.source}
タイトル: ${item.title}
概要: ${item.summary}
URL: ${item.link}

条件:
- h2タグで見出し（2〜3個）
- pタグで本文
- 最後に参照元リンク
- 800〜1000字
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）

文体・トーン:
- 投資を数年続けている普通の会社員が、同僚にランチで話すような自然な口調
- 具体的な数字例を使う（「毎月3万円×20年で試算すると〜」など）
- 「自分だったらこうする」という一人称の意見を1箇所入れる
- 良い面だけでなく「ただ、ここは注意が必要で〜」「正直、このリスクは無視できない」という現実的な視点も入れる
- 書き出しのパターンは毎回変える。問いかけ・事実から入る・体験談風など

絶対に使わないこと:
- 「革新的」「画期的」「注目が集まっています」「トレンド」
- 「〜に悩んでいる方も多いのではないでしょうか」という決まり文句の書き出し
- 「難しく考えすぎなくて大丈夫です。まずは〜から始めてみましょう」という毎回同じ締め
- 「まとめると以下の通りです」「以上が〜のポイントでした」という機械的な締め方`,
    titlePrompt: (title) => `以下を日本語のブログタイトルに変換してください。30文字以内、タイトルのみ出力。
NISA・投資に興味ある普通の人が「これ気になるかも」と思えるような、親しみやすいタイトルで。

${title}`,
  },

  'ai-image': {
    rssSources: [
      { url: 'https://stable-diffusion-art.com/feed/', name: 'Stable Diffusion' },
      { url: 'https://huggingface.co/blog/feed.xml', name: 'HuggingFace' },
      { url: 'https://venturebeat.com/category/ai/feed/', name: 'VentureBeat AI' },
      { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI' },
      { url: 'https://openai.com/blog/rss.xml', name: 'OpenAI' },
    ],
    tags: (source) => ['AI画像生成', source, 'Stable Diffusion'],
    contentPrompt: (item) => `以下のAI画像生成に関するニュース・情報をもとに、日本語のブログ記事をHTMLで書いてください。

ソース: ${item.source}
タイトル: ${item.title}
概要: ${item.summary}
URL: ${item.link}

条件:
- h2タグで見出し（2〜3個）
- pタグで本文
- 最後に参照元リンク
- 800〜1000字
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）

文体・トーン:
- AI画像生成を実際に日々使っているオタクが、Twitterで「これ試してみたんだけど〜」と呟くようなリアルな口調
- 「実際に試したらこうなった」「プロンプトにこれ足したら改善された」という体験談を自然に入れる（実際に試せなくても体験談風に書く）
- LoRA・CFG・Samplerなど技術用語は括弧で補足しつつ自然に使う
- 「ここはまだ微妙」「自分的にはこっちのほうが好み」という正直な感想も入れる
- 書き出しは毎回違うパターンで。発見した瞬間の驚き・試した結果から入るなど

絶対に使わないこと:
- 「革新的」「画期的」「革命」「トレンド」「注目されています」
- 「ぜひ実際に試してみてください！あなたの作品が見たいです」という毎回同じ締め
- 毎回同じ構造（概要→機能→まとめ）の繰り返し
- 「〜を実現します」「〜が可能になります」という宣伝っぽい表現`,
    titlePrompt: (title) => `以下を日本語のブログタイトルに変換してください。30文字以内、タイトルのみ出力。
AI画像生成を使っている人が「お、これ気になる」「試してみようかな」となるようなタイトルで。

${title}`,
  },

  'overseas-tools': {
    rssSources: [
      { url: 'https://www.producthunt.com/feed', name: 'ProductHunt' },
      { url: 'https://techcrunch.com/feed/', name: 'SaaS' },
      { url: 'https://venturebeat.com/feed/', name: 'AI Tools' },
      { url: 'https://thenextweb.com/feed/', name: 'Dev Tools' },
      { url: 'https://zapier.com/blog/feeds/latest/', name: 'Zapier' },
    ],
    tags: (source) => ['海外ツール', 'SaaS', source],
    contentPrompt: (item) => `以下の海外SaaS・ツールに関するニュースをもとに、日本語のブログ記事をHTMLで書いてください。

ソース: ${item.source}
タイトル: ${item.title}
概要: ${item.summary}
URL: ${item.link}

条件:
- h2タグで見出し（3〜4個）、h3タグでサブ見出しも活用する
- pタグで本文（各見出しの下に2〜3段落）
- 箇条書き（ulタグ）や表（tableタグ）を1〜2箇所入れて読みやすくする
- 最後に参照元リンク
- 1200〜1500字（しっかり読み応えのある記事にする）
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）

必ず含める内容:
- ツールの概要・何ができるか（具体的に）
- 主な機能を箇条書きや表で整理
- 日本人が使う場合の具体的なメリット・活用シーン
- 料金プラン（「日本語対応：あり / なし」「料金：無料プランあり / 月額$XX〜 / 完全無料」を明記）
- 類似ツールとの比較または使い始めの手順

文体・トーン:
- 海外ツールを実際に触りながら「あ、これいいかも」「ここはちょっと微妙だな」と思いながらレビューしているような、リアルな一人称の口調
- 良い点だけでなく「ここは正直イマイチ」「日本語対応が弱いのが惜しい」「自分にはちょっと高いかな」という本音も入れる
- 「自分だったらこういう場面で使う」という具体的な使い方を提案する
- 文の長さに変化をつける。短い文と長い文を混ぜる（「これ、地味にすごい。」だけの文もアリ）
- 書き出しのパターンは毎回変える。使ってみた感想から入る・驚いた点から入る・比較から入るなど

絶対に使わないこと:
- 「革新的」「画期的」「革命的」「トレンド」「注目が集まっています」
- 「これ、見つけてしまいました...！」「知ってる人まだ少ないかも」という毎回同じ書き出し
- 「とりあえず無料で試してみてください！損はしないはず」という毎回同じ締め
- 「〜を実現します」「〜を提供しています」「〜が可能になります」という宣伝口調
- 「まとめると以下の通りです」「以上が〜でした」という機械的な締め方`,
    titlePrompt: (title) => `以下を日本語のブログタイトルに変換してください。30文字以内、タイトルのみ出力。
海外ツールに興味ある人が「え、こんなの出たの？」と思わずクリックするようなタイトルで。毎回違うパターンで作ること。

${title}`,
  },
}

module.exports = siteConfigs
