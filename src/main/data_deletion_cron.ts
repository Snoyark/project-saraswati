
import * as gen_utils from '../utils/utils'

import { ChromaClient } from 'chromadb';
import * as _ from 'lodash';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { DELETION_LOOKBACK, NeuroscienceTopic } from '../utils/constants';
import { config } from '@/utils/config';

/*
  Just delete the file using the metadata filters using the Chroma API
*/
const init = async function(topic: string, chroma: ChromaClient) {
  // Initialize ChromaClient
  // await chroma.reset(); // Only for testing - do not have this uncommented
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

const run = async function(vectorstore: Chroma) {
  // get the date from one year in epoch time
  const one_year_ago = new Date(Date.now() - DELETION_LOOKBACK)
  await vectorstore.delete({
    filter: {
      updated_on: {"$lt": one_year_ago.getTime() }
    }
  })
}

const main = async function(topic: string) {
  const chroma = config.chroma_client;
  const chroma_client = await init(topic, chroma)
  console.log('initialized collection')
  while (true) {
    console.log('started run')
    await run(chroma_client)
    console.log('finished run.')
    await log_number_of_entries(topic, chroma)
    // just wait until the next time
    process.exit(0)
    // await gen_utils.delay(60000 * 10)
  }
}

main(NeuroscienceTopic.name)
