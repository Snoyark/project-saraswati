import * as dl_utils from '../utils/download_utils'
import * as gen_utils from '../utils/utils'

import * as arxiv_client from '../clients/arxiv'
import { ChromaClient } from 'chromadb';
import * as _ from 'lodash';
import { Promise as Bluebird } from 'bluebird';
import { Chroma } from '@langchain/community/vectorstores/chroma';
// const argv = require('minimist')(process.argv.slice(2)) (from other repos)
// Idea of this file is to contain all the logic to get data from Arxiv (and any other source)
// and put that data into Chroma
// This should be at some regular cadence that both balances the rate limit requirement and the desire
// to have relatively recent data

// need a library for cron jobs (for later)

/*
Initialize Chroma Connection

Get metadata from Arxiv
Download main file data
Parse from PDF into text
Feed into Chroma
*/
const init = async function(topic: string, chroma: ChromaClient) {
  // Initialize ChromaClient
  await chroma.reset(); // Only for testing - do not have this uncommented
  const collection = await chroma.getOrCreateCollection({ name: topic }).catch((err: Error) => {
    console.log(err);
    throw err;
  });

  const vectorstore = new Chroma(gen_utils.embeddings, {
    index: chroma,
    collectionName: collection.name,
  });
  return vectorstore
}

const log_number_of_entries = async function(topic: string, chroma: ChromaClient) {
  const collection = await chroma.getOrCreateCollection({ name: topic })
  const num_entries = await collection.count()
  console.log(`number of entries in ${topic}: ${num_entries}`)
}

const run = async function(topic: string, vectorstore: Chroma) {
  const search_results = await arxiv_client.get_results(topic)
  
  await Bluebird.map(search_results, async result => {
    // Download the pdf
    const file_path = `./tmp_pdf_download/${gen_utils.getNanoSecTime()}.pdf`
    console.log('downloading')
    const failed = await dl_utils.downloadPdf(result.pdf_link, file_path)
      .then(() => false)
      .catch(() => true)// error encountered, just return from this iteration and skip this file)
    if (failed) {
      return
    }
    console.log(`downloaded ${result.title}`)

    // get the text from the PDF
    const text = await dl_utils.ingest_pdf_to_text(file_path)
    const text_docs = await gen_utils.get_documents_from_text(text)
    const summary_docs = await gen_utils.get_documents_from_text(result.summary)

    // const docs = text_docs.concat(summary_docs)

    console.log(`ingesting ${result.title}`)
    // put the data into Chroma
    await vectorstore.addDocuments(summary_docs, { ids: _.map(_.range(0, summary_docs.length), num => `${result.title}.summary.${num}`) })
    console.log('added summaries')
    await vectorstore.addDocuments(text_docs, { ids: _.map(_.range(0, text_docs.length), num => `${result.title}.full_text.${num}`) })
    console.log(`ingested ${result.title}`)

    console.log(`deleting ${result.title}`)
    // remove the download
    await dl_utils.removeFile(file_path)
    console.log(`deleted ${result.title}`)
    
    await gen_utils.delay(2000)
  }, { concurrency: 1 })
}

const main = async function(topic: string) {
  const chroma = new ChromaClient();
  const chroma_client = await init(topic, chroma)
  console.log('initialized collection')
  while (true) {
    console.log('started run')
    await run(topic, chroma_client)
    console.log('finished run.')
    await log_number_of_entries(topic, chroma)
    // just wait until the next time
    process.exit(0)
    // await gen_utils.delay(60000 * 10)
  }
}

main('neuro')
