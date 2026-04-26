export const DEMO_DATA = {
  extractedText: "環境破壊と相まって、水や空気の汚染が進んでいる。\nあの日、僕は君に会いに行くべきだったのかもしれない。",
  translation: "Because of environmental destruction, water and air pollution are getting worse. Perhaps I should have gone to see you that day.",
  words: [
    { word: "環境", reading: "かんきょう", translation: "environment", partOfSpeech: "Noun", isFunctional: false },
    { word: "破壊", reading: "はかい", translation: "destruction", partOfSpeech: "Noun", isFunctional: false },
    { word: "と", reading: "と", translation: "with", partOfSpeech: "Particle", isFunctional: true },
    { word: "相まって", reading: "あいままって", translation: "coupled with", partOfSpeech: "Verb", isFunctional: false },
    { word: "、", reading: null, translation: null, partOfSpeech: "Punctuation", isFunctional: true },
    { word: "水", reading: "みず", translation: "water", partOfSpeech: "Noun", isFunctional: false },
    { word: "や", reading: "や", translation: "and", partOfSpeech: "Particle", isFunctional: true },
    { word: "空気", reading: "くうき", translation: "air", partOfSpeech: "Noun", isFunctional: false },
    { word: "の", reading: "の", translation: "possessive", partOfSpeech: "Particle", isFunctional: true },
    { word: "汚染", reading: "おせん", translation: "pollution", partOfSpeech: "Noun", isFunctional: false },
    { word: "が", reading: "が", translation: "subject marker", partOfSpeech: "Particle", isFunctional: true },
    { word: "進んでいる", reading: "すすんでいる", translation: "is progressing", partOfSpeech: "Verb", isFunctional: false },
    { word: "。", reading: null, translation: null, partOfSpeech: "Punctuation", isFunctional: true },
    { word: "\n", reading: null, translation: null, partOfSpeech: "Whitespace", isFunctional: true },
    { word: "あの", reading: "あの", translation: "that", partOfSpeech: "Noun", isFunctional: false },
    { word: "日", reading: "ひ", translation: "day", partOfSpeech: "Noun", isFunctional: false },
    { word: "、", reading: null, translation: null, partOfSpeech: "Punctuation", isFunctional: true },
    { word: "僕", reading: "ぼく", translation: "I", partOfSpeech: "Noun", isFunctional: false },
    { word: "は", reading: "は", translation: "topic marker", partOfSpeech: "Particle", isFunctional: true },
    { word: "君", reading: "きみ", translation: "you", partOfSpeech: "Noun", isFunctional: false },
    { word: "に", reading: "に", translation: "to/target", partOfSpeech: "Particle", isFunctional: true },
    { word: "会い", reading: "あい", translation: "to meet (stem)", partOfSpeech: "Verb", isFunctional: false },
    { word: "に", reading: "に", translation: "in order to", partOfSpeech: "Particle", isFunctional: true },
    { word: "行く", reading: "いく", translation: "to go", partOfSpeech: "Verb", isFunctional: false },
    { word: "べき", reading: "べき", translation: "should/ought", partOfSpeech: "Particle", isFunctional: true },
    { word: "だった", reading: "だった", translation: "was (past of da)", partOfSpeech: "Verb", isFunctional: false },
    { word: "の", reading: "の", translation: "nominalizer", partOfSpeech: "Particle", isFunctional: true },
    { word: "か", reading: "か", translation: "question marker", partOfSpeech: "Particle", isFunctional: true },
    { word: "も", reading: "も", translation: "also/even", partOfSpeech: "Particle", isFunctional: true },
    { word: "しれない", reading: "しれない", translation: "might/perhaps", partOfSpeech: "Verb", isFunctional: false },
    { word: "。", reading: null, translation: null, partOfSpeech: "Punctuation", isFunctional: true }
  ],
  grammarMatches: [
    { pointName: "Obligation (べき)", matchedText: "行くべき", explanation: "Combines 'iku' (to go) with 'beki' to express obligation." }
  ],
  suggestedGrammar: [
    {
      name: "と相まって",
      description: "Meaning: together with; along with. Used to express that two or more things are combining to produce a stronger result.",
      pattern: "Noun + と（が）相まって",
      matchedText: "環境破壊と相まって"
    },
    {
      name: "のかもしれない",
      description: "Expresses a possibility that something might be the case.",
      pattern: "plain form + のかもしれない",
      matchedText: "のかもしれない"
    }
  ]
};

export const DEMO_LENS_DATA = {
  blocks: [
    {
      originalText: "道具箱",
      translatedText: "Toolbox / Inventory",
      boundingBox: [100, 100, 200, 300] as [number, number, number, number]
    },
    {
      originalText: "ステータス",
      translatedText: "Status",
      boundingBox: [250, 100, 350, 400] as [number, number, number, number]
    },
    {
      originalText: "セーブ",
      translatedText: "Save",
      boundingBox: [400, 100, 500, 300] as [number, number, number, number]
    }
  ]
};
