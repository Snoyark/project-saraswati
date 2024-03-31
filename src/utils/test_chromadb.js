const ChromaClient = require("chromadb").ChromaClient;
const pdf_util = require('pdf-ts');
const fs = require('node:fs/promises');
const ollama = require('ollama')

const test_research_papers_path = 'C:/Users/neelv/Downloads/research_papers/neuro.pdf'

const setup_chroma_client = async () => {
  const pdf = await fs.readFile(test_research_papers_path);
  const pdf_string = await pdf_util.pdfToText(pdf);

  const client = new ChromaClient()
  console.log('made new client')
   // await client.reset().catch(err => {
   //   console.log(err)
   //   throw err
   // })
   // console.log('made it past reset')
   const collection = await client.getOrCreateCollection({ name: "neuro" }).catch(err => {
    console.log(err)
    throw err
   })
   return client
}


const main = async () => {
  const pdf = await fs.readFile(test_research_papers_path);
  const pdf_string = await pdf_util.pdfToText(pdf);

  const client = new ChromaClient()
  console.log('made new client')
  // await client.reset().catch(err => {
  //   console.log(err)
  //   throw err
  // })
  // console.log('made it past reset')
  const collection = await client.getOrCreateCollection({ name: "neuro" }).catch(err => {
    console.log(err)
    throw err
  })
  // await collection.add({
    // ids: ["neuro1"],
    // metadatas: [{source: "some source?"}],
    // documents: [pdf_string]
  // })

  // This pulls the relevant documents compared to the query text
  const results = await collection.query({
    nResults: 1,
    queryTexts: ["ptsd response in mammals"]
  })

  console.log(results)
}

main();