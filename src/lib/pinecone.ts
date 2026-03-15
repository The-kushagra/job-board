import { Pinecone } from "@pinecone-database/pinecone"

let pineconeClient: Pinecone | null = null

function getClient() {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY?.trim()
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY is missing or empty")
    }
    pineconeClient = new Pinecone({ apiKey })
  }
  return pineconeClient
}

export function getPineconeIndex() {
  const client = getClient()
  return client.index("nexthire")
}
