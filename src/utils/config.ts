/**
 * File to hold the configuration for the project. There should be two main environments:
 *   * local
 *   * production
 * Which will be determined by an environment variable called ENV
 * This will mainly be for the databases (Chroma + Firebase for postgres)
 */

import { ChromaClient } from "chromadb";


/**
 * Enum for the environment - should be LOCAL or PRODUCTION
 */
enum Environment {
  LOCAL,
  PRODUCTION,
}

export type Config = {
  chroma_client: ChromaClient,
}

const get_config = (): Config => {
  const env = process.env.ENV ? Environment[process.env.ENV as keyof typeof Environment] : Environment.LOCAL;
  // TODO validate on the env variables to make sure they're all passed in
  
  let config = {}
  if (env === Environment.LOCAL) {
    config = {
      chroma_client: new ChromaClient({ path: "http://localhost:8000" }),
    }
  } else {
    config = {
      chroma_client: new ChromaClient({ path: process.env.CHROMA_DB_URL }),
    }
  }
  return config as Config
}

export const config = get_config()