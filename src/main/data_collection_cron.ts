import * as dl_utils from '../utils/download_utils'
import * as gen_utils from '../utils/utils'

import * as arxiv_client from '../clients/arxiv'
import { ChromaClient } from 'chromadb';
import * as _ from 'lodash';
import { Promise as Bluebird } from 'bluebird';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { DAY_MS, SUPPORTED_TOPICS, Topic } from '../utils/constants';
import { config } from '../utils/config';
const argv = require('minimist')(process.argv.slice(2))
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
  // await chroma.reset(); // Only for testing - do not have this uncommented
  const collection = await chroma.getOrCreateCollection({ name: topic }).catch((err: Error) => {
    console.error(err)
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

const run = async function(topic: Topic, vectorstore: Chroma) {
  const search_results = await arxiv_client.get_results({
    query: topic.name,
    max_results: 100,
  })
      
  await Bluebird.map(search_results, async result => {
    // Download the pdf
    const file_path = `./tmp_pdf_download/${gen_utils.getNanoSecTime()}.pdf`
        const failed = await dl_utils.downloadPdf(result.pdf_link, file_path)
      .then(() => false)
      .catch(() => true) // error encountered, just return from this iteration and skip this file)
    if (failed) {
      return
    }

    const metadata = {
      created_on: Date.parse(result.created_on.toISOString()),
      updated_on: Date.parse(result.updated_on.toISOString()),
      title: result.title,
      authors: result.authors.join(', '),
    }
    const stringified_metadata = gen_utils.stringify_document_metadata(metadata)

    console.log(`metadata: ${stringified_metadata}`)
    // get the text from the PDF
    const text = await dl_utils.ingest_pdf_to_text(file_path)
    const text_docs = await gen_utils.get_documents_from_text(stringified_metadata + text, metadata)
    const summary_docs = await gen_utils.get_documents_from_text(stringified_metadata + result.summary, metadata)

    // put the data into Chroma 
    await vectorstore.addDocuments(summary_docs, { ids: _.map(_.range(0, summary_docs.length), num => `${result.title}.summary.${num}`) })
        await vectorstore.addDocuments(text_docs, { ids: _.map(_.range(0, text_docs.length), num => `${result.title}.full_text.${num}`) })
    
    // remove the download
    await dl_utils.removeFile(file_path)
    console.log(`added one file to chroma for ${topic.name}: ${JSON.stringify(summary_docs)}`) 
        
    await gen_utils.delay(2000)
  }, { concurrency: 1 })
}

const main = async function() {
  const chroma = config.chroma_client

  if (argv.reset) {
    await chroma.reset()
  }

  await Bluebird.map(SUPPORTED_TOPICS, async topic => {
    const collection_name = gen_utils.remove_upper_and_space(topic.url_name)
    const chroma_client = await init(collection_name, chroma)
    while (true) {
      await run(topic, chroma_client)
      await log_number_of_entries(collection_name, chroma)
      // just wait until the next time
      // process.exit(0)
      await gen_utils.delay(DAY_MS)
    }
  })
  }

main()
