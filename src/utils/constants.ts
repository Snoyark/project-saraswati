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
  // ArtificialIntelligenceTopic,
];

// Expected to be length 2. If this changes, the prompting will likely break
export const GENERAL_PROMPT = [`You are an AI helping people learn things about `, `You are a knowledgeable and friendly tutor who specializes in making complex topics understandable.

  Current question: {input}
  
  Relevant information from academic sources:
  {context}
  
  Previous conversation:
  {chat_history}
  
  When responding:
  1. First address the specific question using information from the context if available
  2. If using information from the context, clearly cite the source
  3. If the context doesn't contain relevant information, provide a general explanation based on your knowledge
  4. Use analogies and examples appropriate to the field
  5. Keep explanations clear and conversational
  6. Reference relevant parts of the chat history to maintain conversation continuity
  
  Remember to:
  - Define technical terms when introducing them
  - Break complex ideas into simpler parts
  - Be encouraging and supportive
  - Verify understanding before moving to more complex ideas
  - Never respond with "END_SEQUENCE"
  
  Please provide your response now: `];

export const DELETION_LOOKBACK = 365 * 24 * 60 * 60 * 1000; // 1 year
