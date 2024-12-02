import { ChatPromptTemplate } from "@langchain/core/prompts"
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import * as _ from "lodash";
import { GENERAL_PROMPT } from "./constants";
import { BaseMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";

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

export const init_and_get_retriever = async (): Promise<any> => {
  console.log('about to wait for loader.load');
  const docs = await loader.load();
  const neuro_docs = await neuro_loader.load();
  console.log('about to wait for the splitter to split the documents');
  const splitDocs = await splitter.splitDocuments(docs);
  const splitNeuroDocs = await splitter.splitDocuments(neuro_docs);

  const chroma = new ChromaClient();
  await chroma.reset();
  const collection = await chroma.createCollection({ name: "neuro" }).catch((err: Error) => {
    console.log(err);
    throw err;
  });
  const vectorstore = new Chroma(embeddings, {
    index: chroma,
    collectionName: collection.name,
  });
  console.log('db initialized');
  await vectorstore.addDocuments(splitDocs);
  await vectorstore.addDocuments(splitNeuroDocs);
  console.log('documents added');

  return vectorstore.asRetriever();
};

export const get_document_chain = async (prompt: ChatPromptTemplate): Promise<any> => {
  const chatModel: SimpleChatModel = get_chat_model();
  const documentChain: any = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });
  console.log('create document chain');
  return documentChain;
};

export const delay = async (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export const create_retrieval_chain = async (topic_name: string) => {
  const retriever = await init_and_get_retriever()
  const prompt = ChatPromptTemplate.fromTemplate(`${GENERAL_PROMPT[0]}${topic_name}${GENERAL_PROMPT[1]}`);
  const document_chain = await get_document_chain(prompt)

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain: document_chain,
  });

  return retrievalChain
}

export function getNanoSecTime() {
  var hrTime = process.hrtime();
  return hrTime[0] * 1000000000 + hrTime[1];
}