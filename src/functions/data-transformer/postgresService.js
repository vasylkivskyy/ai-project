import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

let isTableInitialized = false;

const ensureTableExists = async () => {
  if (!isTableInitialized) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE EXTENSION IF NOT EXISTS vector;
          
          CREATE TABLE IF NOT EXISTS reviews (
            id VARCHAR(255) PRIMARY KEY,
            text TEXT,
            embedding VECTOR(1536),
            sentiment JSONB,
            entities JSONB,
            key_phrases JSONB
          );
          
          CREATE INDEX IF NOT EXISTS reviews_embedding_idx 
          ON reviews USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
        `);
        isTableInitialized = true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Table initialization failed:", error);
      throw error;
    }
  }
};

const formatEmbeddingForPostgres = (embedding) => {
  if (!Array.isArray(embedding)) {
    console.error("Embedding is not an array:", typeof embedding, embedding);
    throw new Error("Embedding must be an array");
  }

  const vectorString = `[${embedding.join(",")}]`;
  console.log(
    "Formatted vector string (first 100 chars):",
    vectorString.substring(0, 100)
  );

  return vectorString;
};

export const saveToPostgreSQL = async (
  reviewId,
  reviewText,
  embedding,
  insights
) => {
  const client = await pool.connect();

  try {
    await ensureTableExists();
    const formattedEmbedding = formatEmbeddingForPostgres(embedding);

    const query = `
      INSERT INTO reviews (id, text, embedding, sentiment, entities, key_phrases)
      VALUES ($1, $2, $3::vector, $4, $5, $6)
    `;
    const values = [
      reviewId,
      reviewText,
      formattedEmbedding,
      JSON.stringify(insights.sentiment),
      JSON.stringify(insights.entities),
      JSON.stringify(insights.keyPhrases),
    ];

    await client.query(query, values);

    console.log("Data saved to PostgreSQL successfully");
  } catch (error) {
    console.error("Error saving data to PostgreSQL:", error);
    throw error;
  } finally {
    client.release();
  }
};
