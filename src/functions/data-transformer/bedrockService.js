import { BedrockEmbeddings } from "@langchain/aws";

const embeddings = new BedrockEmbeddings({
  region: process.env.BEDROCK_AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID,
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY,
  },
  model: "amazon.titan-embed-text-v1",
});

export const getEmbeddingFromBedrock = async (text) => {
  try {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error("Error getting embedding from Bedrock:", error);
    throw error;
  }
};
