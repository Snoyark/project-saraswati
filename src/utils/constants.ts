// metadata about the topics for UI visibility.
export type Topic = {
  name: string,
  alt_names: string[],
  url_name: string,
}

export const NeuroscienceTopic: Topic = {
  name: 'Neuroscience',
  alt_names: ['neuroscience'],
  url_name: 'neuro',
}

export const ArtificialIntelligenceTopic: Topic = {
  name: 'Artificial Intelligence',
  alt_names: ['artificial intelligence', 'ai'],
  url_name: 'artificial_intelligence',
}

export const SUPPORTED_TOPICS: Topic[] = [
  NeuroscienceTopic,
  ArtificialIntelligenceTopic,
];

// Expected to be length 2. If this changes, the prompting will likely break
export const GENERAL_PROMPT = [`You are a AI helping people learn things about `,`. You should provide the source of the information if it comes from the context provided. Answer the following question using the following context if the information is there, and only if it isn't give a general response:
  <context>
  {context}
  </context>
  Question: {input}`]

export const DELETION_LOOKBACK = 365 * 24 * 60 * 60 * 1000; // 1 year
