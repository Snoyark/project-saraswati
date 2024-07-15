import axios from "axios"
import * as xmlParser from "xml-js"
import * as _ from "lodash"

const base_url = 'http://export.arxiv.org/api/'

// think about backfilling data from 2018 to now, store them in Chroma. This backfill would take a while
// Could also backfill from last year on, and then run this once a day to grab any new data from the last day (while deleting stuff older than a year)
// can kick off a delete via filter

// Therefore there is no need to call the API more than once in a day for the same query. Please cache your results
// Need a cron for this in Firebase

// Main idea is to use the query to get an article summary, a link to the paper itself, created_on, and the authors

type ArxivArticle = {
  title: string,
  created_on: Date,
  updated_on: Date,
  pdf_link: string,
  summary: string,
}

export const search = (query:string) => {
  // Search Query stuff: https://info.arxiv.org/help/api/user-manual.html#query_details
  return axios.get(`${base_url}query?search_query=${query}&sortBy=submittedDate&sortOrder=descending`)
}

const main = async () => {
  const res = await search('neuroscience')
  const js_data = JSON.parse(xmlParser.xml2json(res.data, { compact: true, spaces: 2 }))
  // console.log(js_data.feed.entry)
  const articles: ArxivArticle[] = _.map(js_data.feed.entry, entry => {
    return {
      title: entry.title._text,
      created_on: new Date(Date.parse(entry.published._text)),
      updated_on: new Date(Date.parse(entry.updated._text)),
      pdf_link: entry.id._text.replace('abs', 'pdf'),
      summary: entry.summary._text,
    } 
  })
  console.log(articles)
}

main()