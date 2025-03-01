import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import * as _ from "lodash";
import { GENERAL_PROMPT, Topic } from "./constants";
import { BaseMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { config } from "./config";
import { DefaultEmbeddingFunction } from "chromadb";

const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { ChatOllama } = require("@langchain/community/chat_models/ollama");
const { ChromaClient } = require("chromadb");
const { Chroma } = require("@langchain/community/vectorstores/chroma");

export type RetrievalChain = Runnable<{
  input: string;
  chat_history?: BaseMessage[] | string;
} & {
  [key: string]: unknown;
}, {
  context: Document[];
  answer: unknown;
} & {
  [key: string]: unknown;
}>;

export type WebsocketMessage = {
  current_question: string,
  chat_history: { role: string, content: string }[] | null | undefined,
  current_paper?: string, // if defined, treat as focused, else treat as general
  from_time?: number,
  to_time?: number
}


export const splitter: RecursiveCharacterTextSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const loader: CheerioWebBaseLoader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);

const neuro_loader: CheerioWebBaseLoader = new CheerioWebBaseLoader(
  "https://www.jneurosci.org/content/44/13/e1794232024"
);

export const embeddings: OllamaEmbeddings = new OllamaEmbeddings({
  model: 'llama2:latest',
  maxConcurrency: 5,
});

export const get_chat_model = (model?: string): SimpleChatModel => {
  return new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: model ?? "llama2:latest",
  });
};

export const get_documents_from_text = async (text: string, metadata: any = {}) => {
  const text_split = await splitter.splitText(text)
  const text_docs = _.map(text_split, text_piece => {
    return { pageContent: text_piece, metadata }
  })
  return text_docs
}

export const init_and_get_retriever = async (topic: Topic): Promise<any> => {
  console.log('about to wait for loader.load');

  const chroma = config.chroma_client;
  // await chroma.reset();
  console.log(`Attempting to create a collection with name ${topic.url_name}`)
  const collections = await chroma.listCollections()
  console.log(collections)
  const collection = await chroma.getCollection({ name: topic.url_name, embeddingFunction: new DefaultEmbeddingFunction() }).catch((err: Error) => {
    console.log(err);
    throw err;
  });
  const vectorstore = new Chroma(embeddings, {
    index: chroma,
    collectionName: collection.name,
  });
  console.log('db initialized');

  // this is a chroma/langchain vectorstore
  return vectorstore.asRetriever({
    k: 10, 
  });
};

const init_and_get_dynamic_retriever = async ({
  topic,
  chain_scope,
  title,
  oldest_time,
}: {
  topic: Topic,
  chain_scope: string,
  title?: string,
  oldest_time?: number
}): Promise<any> => {
  console.log('about to wait for loader.load');

  const chroma = config.chroma_client;
  // await chroma.reset();
  console.log(`Attempting to create a collection with name ${topic.url_name}`)
  const collection = await chroma.getCollection({ name: topic.url_name, embeddingFunction: new DefaultEmbeddingFunction() }).catch((err: Error) => {
    console.log(err);
    throw err;
  });
  const vectorstore = new Chroma(embeddings, {
    index: chroma,
    collectionName: collection.name,
  });
  console.log('db initialized');

  const title_filter = title ? { title: title } : {};
  const date_filter = oldest_time ? { updated_on: { "$gt": oldest_time } } : {};
  const retriever_options = {
    k: 10,
    filter: {
      ...title_filter,
      ...date_filter,
    }
  }
  return vectorstore.asRetriever(retriever_options);
}

export const get_document_chain = async (prompt: ChatPromptTemplate): Promise<any> => {
  const chatModel: SimpleChatModel = get_chat_model();
  const documentChain: any = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
    returnSourceDocuments: true,
    documentPrompt: new PromptTemplate({ 
      template: "If the question mentions a title or a paper name or has a phrase in quotations, assume it's the title and match on it. If it asks about latest or most recent, make the query based on updated_on or created_on.",
      inputVariables: [],
    }),
  });
  return documentChain;
};

export const delay = async (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export const create_static_retrieval_chain = async (topic: Topic) => {
  const retriever = await init_and_get_retriever(topic)
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", GENERAL_PROMPT[0] + topic.name + GENERAL_PROMPT[1]],
  ])

  const document_chain = await get_document_chain(prompt)

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain: document_chain,
  });

  return retrievalChain
}

export const create_dynamic_retrieval_chain = async (params: {
  topic: Topic,
  chain_scope: string,
  title?: string,
  from_time?: number,
  to_time?: number,
}) => {
  if (!params.title && !(params.from_time && params.to_time)) {
    throw new Error('title or from_time/to_time must be provided')
  }
  const retriever = await init_and_get_dynamic_retriever(params)
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", GENERAL_PROMPT[0] + params.topic.name + GENERAL_PROMPT[1]],
  ])

  const document_chain = await get_document_chain(prompt)

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain: document_chain,
  });

  return retrievalChain
}

export const get_retriever_key = (websocket_msg: WebsocketMessage, topic: string) => {
  const type = websocket_msg.from_time ? 'general' : 'specific'
  const metadata = websocket_msg.current_paper 
    ? websocket_msg.current_paper : 
      websocket_msg.from_time 
        ? `${websocket_msg.from_time}_${websocket_msg.to_time}` : '' 
  return `${type}_${topic}_${metadata}`
}

export function getNanoSecTime() {
  var hrTime = process.hrtime();
  return hrTime[0] * 1000000000 + hrTime[1];
}

export function remove_upper_and_space(text: string) {
  return text.toLowerCase().replace(' ', '_')
}

type DocumentMetadata = {
  created_on: number,
  updated_on: number,
  title: string,
  authors: string,
}

export function stringify_document_metadata(metadata: DocumentMetadata) {
  return `The following document was created on ${new Date(metadata.created_on).toISOString()} and updated on ${new Date(metadata.updated_on).toISOString()}. Title: ${metadata.title}. Authors: ${metadata.authors}. `
}