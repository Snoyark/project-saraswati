import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";

import { get_results } from "../clients/arxiv";
import * as dl_utils from '../utils/download_utils'
import * as gen_utils from '../utils/utils'
import { AGENT_PROMPT } from "./constants";

export const construct_agent = () => {
  const search_arxiv = tool(async ({ subject, number_of_results }) => {
    const results = await get_results({ query: `"${subject}"`, max_results: parseInt(number_of_results ?? "5") })
    return JSON.stringify(results)
  }, {
    name: "search_arxiv",
    description: "A tool to find the latest research papers on a topic. This queries Arxiv to find the latest paper.",
    schema: z.object({
      subject: z.string().describe("The subject to search on Arxiv. This can be an academic topic or a specific paper."),
      number_of_results: z.string().optional().describe("The number of results to return. Defaults to 5."),
    }),
  });
  
  const download_pdf_links = tool(async ({ url }) => {
    const file_path = `./tmp_pdf_download/${gen_utils.getNanoSecTime()}.pdf`
    const failed = await dl_utils.downloadPdf(url, file_path)
      .then(() => false)
      .catch(err => {
        console.log(`failed to download: ${err}`)
        return true
      }) // error encountered, just return from this iteration and skip this file)
    if (failed) {
      return "failed to download"
    } else {
      return await dl_utils.ingest_pdf_to_text(file_path)
    }
  }, {
    name: "download_pdf_links",
    description: "Call to download pdfs from url.",
    schema: z.object({
      url: z.string().describe("The url to download the pdf from. This should come from the search_arxiv tool."),
    }),
  })

  const model = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama3.2",
  });
  
  return createReactAgent({
    llm: model,
    tools: [search_arxiv, download_pdf_links],
    prompt: AGENT_PROMPT,//"You are an AI Assistant trained at pulling information from data sources so the user can understand research papers. Focus on being friendly and explaining things. If you are asked about a specific paper, you should use the tool for searching, get the url, then download the file and get the data from it, and use that to answer the question."
  });
}