/**
 * File to hold the configuration for the project. There should be two main environments:
 *   * local
 *   * production
 * Which will be determined by an environment variable called ENV
 * This will mainly be for the databases (Chroma + Firebase for postgres)
 */

import { ChromaClient } from "chromadb";
import { createServer } from "http";
import { WebSocketServer } from "ws";


/**
 * Enum for the environment - should be LOCAL or PRODUCTION
 */
enum Environment {
  LOCAL,
  PRODUCTION,
}

export type Config = {
  chroma_client: ChromaClient,
  websocket_server: WebSocketServer
}

// TODO: do this securely
export const set_base_vars = () => {
  process.env.LANGSMITH_TRACING = "true"
  process.env.LANGSMITH_ENDPOINT = "https://api.smith.langchain.com"
  process.env.LANGSMITH_API_KEY = "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"
  process.env.LANGSMITH_PROJECT = "project-saraswati"
}

const get_config = (): Config => {
  set_base_vars()
  const env = process.env.ENV ? Environment[process.env.ENV as keyof typeof Environment] : Environment.LOCAL;
  // TODO validate on the env variables to make sure they're all passed in
  
  let config = {}
  if (env === Environment.LOCAL) {
    // Create express app and HTTP server
    // const app = express();
    // const server = createServer(app);
    config = {
      chroma_client: new ChromaClient({ path: "http://localhost:8000" }),
      // websocket_server: new WebSocketServer({ port: 8080 }), // TODO: use the websocket from config
    }
  } else {
    config = {
      chroma_client: new ChromaClient({ path: process.env.CHROMA_DB_URL }),
      // websocket_server: new WebSocketServer({ port: parseInt(process.env.WEBSOCKET_PORT || '8080') }), // TODO: make this work better with certificates
    }
  }
  return config as Config
}

export const config = get_config()

function express() {
  throw new Error("Function not implemented.");
}
