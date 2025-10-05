import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const COLLECTION_NAME = "resume_data";

// PDF text extraction
async function extractPdfText(fileName: string): Promise<string> {
  const filePath = path.join(__dirname, fileName);
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// Split text with LangChain splitter
async function splitTextWithLangchain(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });
  return splitter.splitText(text);
}

// OpenAI embedding generator
async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// Google generative embedding generator
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function generateGeminiEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Create collection in Qdrant
async function createCollection() {
  try {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 768, // text-embedding-004 produces 768-dimensional vectors
        distance: "Cosine",
      },
    });
    console.log("Collection created successfully");
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("Collection already exists");
    } else {
      throw error;
    }
  }
}

// Upload embeddings to Qdrant
async function uploadToQdrant(chunks: string[], embeddings: number[][]) {
  const points = chunks.map((chunk, index) => ({
    id: index,
    vector: embeddings[index],
    payload: {
      text: chunk,
      source: "Mani Resume.pdf",
      timestamp: new Date().toISOString(),
    },
  }));

  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: points,
  });

  console.log(`Uploaded ${points.length} chunks to Qdrant`);
}

// Search function (for HR queries)
async function searchResume(query: string, limit: number = 5) {
  const queryEmbedding = await generateGeminiEmbedding(query);

  const searchResult = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: limit,
    with_payload: true,
  });

  return searchResult.map((result) => ({
    text: result.payload?.text,
    score: result.score,
  }));
}
// Process chunks and embed with chosen method
async function embedChunks(
  chunks: string[],
  useOpenAI = true
): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    let emb: number[];
    if (useOpenAI) {
      emb = await generateOpenAIEmbedding(chunk);
    } else {
      emb = await generateGeminiEmbedding(chunk);
    }
    embeddings.push(emb);
  }
  return embeddings;
}

// Main runner function
async function run() {
  try {
    // const text = await extractPdfText("Mani Resume.pdf");
    // const chunks = await splitTextWithLangchain(text);

    // console.log("Total chunks:", chunks.length);

    // Change useOpenAI flag to choose embedding provider
    // const embeddings = await embedChunks(chunks, /* useOpenAI = */ false);

    // Step 3: Create collection and upload
    // await createCollection();
    // await uploadToQdrant(chunks, embeddings);

    // Step 4: Test search
    console.log("\n--- Testing Search ---");
    const results = await searchResume("Top 3 Projects of mai");
    results.forEach((result, i) => {
      console.log(`\nResult ${i + 1} (score: ${result.score}):`);
      console.log(result.text);
    });

    // console.log("First embedding vector sample:", embeddings[0].slice(0, 5));
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute

run();

// import { QdrantClient } from "@qdrant/js-client-rest";

// const client = new QdrantClient({
//   url: "https://55fa07db-307d-4f5f-8dfe-24e60e6552a0.us-east4-0.gcp.cloud.qdrant.io:6333",
//   apiKey:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.GCkM2h6UkrxIU9ADWl217msr57o9RRrdwzgtQZTgecc",
// });

// try {
//   const result = await client.getCollections();
//   console.log("List of collections:", result.collections);
// } catch (err) {
//   console.error("Could not get collections:", err);
// }
