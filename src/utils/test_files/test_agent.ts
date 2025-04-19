import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";

import { z } from "zod";
import { get_results } from "../../clients/arxiv";
import * as dl_utils from '../../utils/download_utils'
import * as gen_utils from '../../utils/utils'

const search = tool(async ({ query }) => {
  if (query.toLowerCase().includes("sf") || query.toLowerCase().includes("san francisco")) {
    return "It's 60 degrees and foggy."
  }
  return "It's 90 degrees and sunny."
}, {
  name: "search",
  description: "Call to surf the web.",
  schema: z.object({
    query: z.string().describe("The query to use in your search."),
  }),
});

const search_arxiv = tool(async ({ subject }) => {
  return await get_results({ query: subject })
}, {
  name: "search",
  description: "Call to search papers on Arxiv",
  schema: z.object({
    subject: z.string().describe("The subject to search on Arxiv."),
  }),
});

const download_pdf_links = tool(async ({ url }) => {
  const file_path = `./tmp_pdf_download/${gen_utils.getNanoSecTime()}.pdf`
  const failed = await dl_utils.downloadPdf(url, file_path)
    .then(() => false)
    .catch(() => true) // error encountered, just return from this iteration and skip this file)
  return url
}, {
  name: "download_pdf_links",
  description: "Call to download pdfs from url.",
  schema: z.object({
    url: z.string().describe("The url to download the pdf from."),
  }),
})

const model = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "qwq",
});

const agent = createReactAgent({
  llm: model,
  tools: [search_arxiv],
});

const main = async () => {
  console.log("Starting...");
  const result = await agent.invoke(
    {
      messages: [{
        role: "user",
        content: "What is the latest paper published on neuroscience?"
      }]
    }
  );
  console.log(result);
  process.exit(0)
}

main()
