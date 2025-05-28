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

const DEFAULT_MAX_RESULTS = 100

type ArxivArticle = {
  title: string,
  authors: string[],
  created_on: Date,
  updated_on: Date,
  pdf_link: string,
  summary: string,
}

export async function* paginated_search({
  query, 
  total_num_results = 100,
  max_date,
}: {
  query: string, 
  total_num_results: number,
  max_date?: number // epoch timestamp. Used to only include things from now to this date
}) {
  let start = 0
  try {
    while (start < total_num_results) {
      const results = await get_results({
        query,
        start,
      })
      if (max_date && results.length > 0 && results[0].created_on.getTime() < max_date) {
        console.log('paginated ended early because of max_date')
        break
      }
      start += DEFAULT_MAX_RESULTS
    }
  } catch {
    // Only error expected is when the start > than the number of results
  } finally {
    // cleanup?
  }
}

export const search = ({
  query, 
  max_results = DEFAULT_MAX_RESULTS,
  start = 0,
}: {
  query: string, 
  max_results?: number,
  start?: number,
}) => {
  // Search Query stuff: https://info.arxiv.org/help/api/user-manual.html#query_details
  // found that '-' doesn't work in queries - replacing it with ' '
  const full_url = `${base_url}query?search_query=${query.replace(/-/g, ' ')}&sortBy=submittedDate&sortOrder=descending&max_results=${max_results}&start=${start}`
  return axios.get(full_url)
    // .catch(err => { console.log('Got an error');console.log(err.response); throw err })
}

const process_result = (entry: any) => {
  const authors = _.map(entry.author, author => {
    if ('name' in author) {
      return author.name._text
    }
    return author._text
  })
  return {
    title: entry.title._text,
    authors,
    created_on: new Date(Date.parse(entry.published._text)),
    updated_on: new Date(Date.parse(entry.updated._text)),
    pdf_link: entry.id._text.replace('abs', 'pdf'),
    summary: entry.summary._text,
  } 
}

export const get_results = async ({
  query, 
  max_results = DEFAULT_MAX_RESULTS,
  start = 0,
}: {
  query: string, 
  max_results?: number,
  start?: number,
}) => {
  const res = await search({
    query, 
    max_results,
    start,
  })
  const js_data = JSON.parse(xmlParser.xml2json(res.data, { compact: true, spaces: 2 }))
  if (!_.isArray(js_data.feed.entry)) {
    return [process_result(js_data.feed.entry)]
  }
  const articles: ArxivArticle[] = _.map(js_data.feed.entry, entry => {
    return process_result(entry)
  })
  return articles
}

get_results({ query: '"From Empirical Brain Networks towards Modeling Music Perception"' })