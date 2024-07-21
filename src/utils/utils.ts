import { ChatPromptTemplate } from "langchain/prompts";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { SimpleChatModel } from "langchain/chat_models/base";
import { VectorStoreRetriever } from "langchain/vectorstores/base";

const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { ChatOllama } = require("@langchain/community/chat_models/ollama");
const { ChromaClient } = require("chromadb");
const { Chroma } = require("@langchain/community/vectorstores/chroma");


const splitter: RecursiveCharacterTextSplitter = new RecursiveCharacterTextSplitter();

const loader: CheerioWebBaseLoader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);

const neuro_loader: CheerioWebBaseLoader = new CheerioWebBaseLoader(
  "https://www.jneurosci.org/content/44/13/e1794232024"
);

const embeddings: OllamaEmbeddings = new OllamaEmbeddings({
  model: 'llama2:latest',
  maxConcurrency: 5,
});

export const get_chat_model = (model?: string): SimpleChatModel => {
  return new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: model ?? "llama2:latest",
  });
};

export const init_and_get_retriever = async (): Promise<VectorStoreRetriever> => {
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