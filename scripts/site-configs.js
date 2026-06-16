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
    filterKeywords: [
      'tool', 'app', 'software', 'platform', 'SaaS', 'API', 'AI', 'automation',
      'productivity', 'launch', 'startup', 'plugin', 'extension', 'dashboard',
      'no-code', 'nocode', 'workflow', 'integration', 'generator', 'assistant',
      'browser', 'open source', 'open-source', 'feature', 'chatbot', 'agent',
      'ツール', 'アプリ', 'サービス', '自動化', '生成', 'プラットフォーム',
    ],
    tags: (source) => ['海外ツール', 'SaaS', source],
    contentPrompt: (item) => `以下の海外SaaS・ツールに関するニュースをもとに、日本語の「解説記事」をHTMLで書いてください。あなたは海外テック情報を日本語で噛み砕いて伝える編集部のライターです。実際にツールを使った体験を装ってはいけません。

ソース: ${item.source}
タイトル: ${item.title}
概要: ${item.summary}
URL: ${item.link}

【立場・前提（最重要）】
- これは編集部が海外メディアの報道をもとにまとめた「解説・紹介記事」。自分が実際に使った体験談として書かないこと
- 「使ってみた」「触ってみた」「試してみた」「3日使った」「自分が最初に驚いたのは」など、体験を捏造する一人称表現は厳禁
- 概要（ソース）に書かれていない具体的な料金・数値・対応言語・機能を創作しないこと。不明なものは「公式サイトで要確認」と正直に書く

条件:
- h2タグで見出し（3個程度）、必要に応じてh3も
- pタグで本文（各見出しの下に2〜3段落）
- 箇条書き（ulタグ）を1〜2箇所。表（tableタグ）はソースから確実に分かる情報がある場合のみ
- 最後に「参照元」としてaタグで元記事リンク（href="${item.link}"）
- 1000〜1400字
- HTMLタグのみ出力（\`\`\`やhtml宣言・bodyタグ不要）

書く内容:
- このツール／サービスが何で、ソースによると何ができると報じられているか
- どんな課題を解決しうるか、日本のユーザーにとっての意味（編集部としての分析・考察）
- 不明点・注意点を正直に（「日本語対応は公式未確認」「料金詳細は要確認」など）

文体・トーン:
- 海外情報を翻訳・整理して読者に届ける、落ち着いた解説調。体験談ではなく分析・解説
- 「〜と報じられている」「ソースによると〜」と出典を明確にし、断定を避けて「〜とみられる」「〜の可能性がある」を適度に使う
- 良い点と気になる点の両方に触れる（使用感の捏造はせず、あくまで公開情報・仕様ベースの評価）
- 文の長さに変化をつける

絶対に使わないこと:
- 「使ってみた」「触ってみた」「試してみた」「3日使った」など体験を装う表現
- 「革新的」「画期的」「革命的」「トレンド」「注目が集まっています」
- 「〜を実現します」「〜を提供しています」「〜が可能になります」という宣伝口調
- ソースに無い料金・数値・機能の創作
- 「まとめると以下の通りです」「以上が〜でした」という機械的な締め方`,
    titlePrompt: (title) => `以下を日本語の解説記事タイトルに変換してください。30文字以内、タイトルのみ出力。
海外ツールに関心がある人が内容を知りたくなる、誇張のない自然なタイトルで。煽りや「使ってみた」などの体験を装う表現は使わない。

${title}`,
  },
}

module.exports = siteConfigs
