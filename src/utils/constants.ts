export type Topic = {
  name: string,
  alt_names: string[],
  url_name: string,
}

const NeuroscienceTopic: Topic = {
  name: 'Neuroscience',
  alt_names: ['neuroscience'],
  url_name: 'neuro',
}

const ArtificialIntelligenceTopic: Topic = {
  name: 'Artificial Intelligence',
  alt_names: ['artificial intelligence', 'ai'],
  url_name: 'ai',
}

export const SUPPORTED_TOPICS: Topic[] = [
  NeuroscienceTopic,
  ArtificialIntelligenceTopic,
];