import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output, env } from "node:process";
import { delay, get_document_chain, init_and_get_retriever } from "../utils";
const { ChatOllama } = require("@langchain/community/chat_models/ollama");
const ChromaClient = require("chromadb").ChromaClient;
const { CheerioWebBaseLoader } =  require("langchain/document_loaders/web/cheerio");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { Chroma } = require("@langchain/community/vectorstores/chroma")
const { MemoryVectorStore } = require("langchain/vectorstores/memory")
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
// const { createRetrievalChain } = require("langchain/chains/retrieval");
import { createRetrievalChain } from "langchain/chains/retrieval";
import { SUPPORTED_TOPICS } from "../constants";
const pdf_util = require('pdf-ts');
const fs = require('node:fs/promises');
const { Document } = require("@langchain/core/documents");
const { createHistoryAwareRetriever } = require("langchain/chains/history_aware_retriever");
const { MessagesPlaceholder } = require("@langchain/core/prompts");

const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2:latest",
});

const main = async function() {
  const readline = createInterface({ input, output });

  const retriever = await init_and_get_retriever(SUPPORTED_TOPICS[0])
  const prompt = ChatPromptTemplate.fromTemplate(`You are a AI helping people learn things about neuroscience and artificial intelligence. You should provide the source of the information if it comes from the context provided. Answer the following question using the following context if the information is there, and only if it isn't give a general response:
  <context>
  {context}
  </context>
  Question: {input}`);
  const document_chain = await get_document_chain(prompt)

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain: document_chain,
  });

  // const chatbotType = await readline.question(
  //   "What type of chatbot would you like to create? "
  // );
  // const messages = [{ role: "system", content: chatbotType }];

  const messages = [];
  let userInput = await readline.question("Ask me your questions!\n\n");

  // Main event loop for the conversation
  while (userInput !== ".exit") {
    messages.push({ role: "user", content: userInput });
    try {
      const stream = await retrievalChain.stream({ input: userInput })
      let full_answer = ""
      for await (const stream_chunk of stream) {
        if (typeof stream_chunk.answer === 'string') {
          full_answer += stream_chunk.answer as string
          // would add this to a buffer or react state and show this on the web terminal
        }
      }
      console.log(full_answer)
      
      if (full_answer === "") {
        userInput = await readline.question("\nNo response, try asking again\n");
      } else {
        userInput = await readline.question("\n");
      }

      const botMessage = { role: 'bot', content: full_answer };
      if (botMessage) {
        messages.push(botMessage);
      }
    } catch (error) {
      console.log(error);
      userInput = await readline.question("\nSomething went wrong, try asking again\n");
    }
  }

  readline.close();
}

main()
