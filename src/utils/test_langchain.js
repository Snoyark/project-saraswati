const { ChatOllama } = require("@langchain/community/chat_models/ollama");
const ChromaClient = require("chromadb").ChromaClient;
const { CheerioWebBaseLoader } =  require("langchain/document_loaders/web/cheerio");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { Chroma } = require("@langchain/community/vectorstores/chroma")
const { MemoryVectorStore } = require("langchain/vectorstores/memory")
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const pdf_util = require('pdf-ts');
const fs = require('node:fs/promises');
const { Document } = require("@langchain/core/documents");

const splitter = new RecursiveCharacterTextSplitter();

const test_research_papers_path = 'C:/Users/neelv/Downloads/research_papers/neuro.pdf'

const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);

const neuro_loader = new CheerioWebBaseLoader(
  "https://www.jneurosci.org/content/44/13/e1794232024"
);

const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2:latest",
});

const embeddings = new OllamaEmbeddings({
  model: 'llama2:latest',
  maxConcurrency: 5,
})

const getChromaClient = async () => {
  const client = new ChromaClient()
  return client
}

const main = async () => {
  const pdf = await fs.readFile(test_research_papers_path);
  const pdf_string = await pdf_util.pdfToText(pdf);
  console.log('about to wait for loader.load')
  const docs = await loader.load();
  const neuro_docs = await neuro_loader.load();
  // console.log(docs.length);
  console.log('about to wait for the splitter to split the documents')
  const splitDocs = await splitter.splitDocuments(docs);
  const splitNeuroDocs = await splitter.splitDocuments(neuro_docs);
  console.log(splitDocs.length);
  // console.log('creating the in memory vector store')
  // const vectorstore = await MemoryVectorStore.fromDocuments(
  //   splitDocs,
  //   embeddings,
  // )
  const chroma = await getChromaClient()
  await chroma.reset()
  const collection = await chroma.createCollection({ name: "neuro" }).catch(err => {
    console.log(err)
    throw err
  })

  const vectorstore = new Chroma(embeddings, {
    client: chroma,
    collection_name: collection.name,
  })

  console.log('db initialized')
  await vectorstore.addDocuments(splitDocs)
  await vectorstore.addDocuments(splitNeuroDocs)
  console.log('documents added')
  // const vectorstore = await Chroma.fromDocuments(splitDocs, embeddings)
  const prompt =
  ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}`);

  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });
  console.log('create document chain')
  // const res = await documentChain.invoke({
  //   input: "what is langsmith",
  //   context: [
  //     new Document({
  //       pageContent: "LangSmith is someone who hammers out the details of a language."
  //     }),
  //     new Document({
  //       pageContent: "LangSmith is a developer tool that helps with AI."
  //     })
  //   ]
  // })

  const retriever = vectorstore.asRetriever()
  console.log('created retriever')
  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain: documentChain
  });

  const result = await retrievalChain.invoke({
    input: "what is langsmith"
  })

  console.log(result.answer)

  const result2 = await retrievalChain.invoke({
    input: "Can you explain about oligodendrocyte maturation?"
  })
  console.log(result2.answer)
}

main()