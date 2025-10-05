import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

// node src/lib/extractEmbedStore.ts to run this file addd this command

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

// Additional professional experience text
const ADDITIONAL_EXPERIENCE = `
### Professional Experience (Up to October 2025)

#### **Novalnet e-Solutions**
During my tenure at Novalnet e-Solutions, I contributed to several impactful projects. Some of the notable ones include:

- **Feedback Page**  
  - Built a user feedback system where users can submit feedback along with its type and upload multiple images.  
  - Upon submission, feedback details are stored in the database through a backend service.  
  - Designed an admin interface to view and manage user feedback. Admins can view feedback images in a modal and mark them as resolved.  
  - Implemented a notification system to inform users about feedback resolution based on the feedback type.

- **Session Lockout**  
  - Developed functionality to detect user activity (keyboard and mouse events) to determine whether the user is active or inactive.
  - When inactive, the application redirects users and sends a backend request to mark their session as inactive.
  - Designed a seamless reauthentication process, allowing users to unlock their session by entering their password and resuming their previous activity.

#### **Siaratech (IntoAEC)**
At Siaratech, I participated in various projects, delivering innovative solutions. Some of the prominent ones include:

- **Product Clipper**  
  - Purpose: Created a Chrome extension to streamline the management of product details from external websites for an AEC SaaS platform.
  - Functionality: Users can download the extension, select relevant product details, and add them to their SaaS account effortlessly.
  - Impact: The extension significantly reduced manual efforts, saving time and enhancing workflow efficiency for AEC professionals.

- **Product and Service Feature**  
  - Designed and developed an application using Next.js, enabling architects to add their products and services to the platform.
  - Backend development was handled using Express.js, with product and service data stored in a database.
  - Utilized AWS S3 for secure image uploads and managed state using useState for products and useReducer for services.
  - The products and services were displayed dynamically to customers, creating a seamless user experience.

- **Additional Contributions**  
  - Worked on diverse tasks like invoice previews, generating purchase orders from estimates, and enabling invoice downloads.

### Personal Projects

- **Job Finder**  
  - Built a full-stack job portal using React (frontend), Express (backend), and MongoDB (database).
  - Employers can create accounts and post job openings, while job seekers can browse and filter job postings by location, experience, and other criteria.
  - URL: https://nameismani-jobfinder-mern.netlify.app/user-auth
  - Demo Credentials: Email: mm2729025@gmail.com, Password: Mani#1766256
  - Note: Deployment issues may occur as it was deployed in January 2024.

- **Chat App**  
  - Developed a real-time chat application similar to WhatsApp using the MERN stack and Socket.io for connection persistence.
  - Users can log in and chat with others in real time.
  - URL: https://mern-live-chat-app.netlify.app
  - Demo Credentials: Email: mm2729025@gmail.com, Password: Mani#1766256
  - Note: May experience downtime as it was last updated in March 2024.

- **MERN E-Commerce**  
  - Designed an e-commerce platform where users can browse products, log in, and complete purchases via Stripe (test payment gateway).
  - Admins can manage products directly through the platform.
  - URL: https://nameismani-mern-ecommerce.netlify.app
  - Note: Last updated in April 2024.

- **Turf Slot Booking**  
  - Developed a slot-booking platform using Next.js for both frontend and backend.
  - Employed NextAuth for authentication and implemented cron jobs locally using node-cron. Later migrated to Vercel with GitHub workflows for serverless cron jobs.
  - Features include managing time slots from Monday to Sunday and viewing one-week availability starting from the current date.
  - URL: https://turfproject.vercel.app
  - Demo Credentials: Email: mani@gmail.com, Password: Mani#1766256
  - Note: Last updated in November 2024.

### Freelance Projects

- **JInterior Design**  
  - Created a website to showcase shop products for a friend's interior design business.
  - Initially developed using React.js and later migrated to Next.js for improved SEO.
  - Gained expertise in implementing React carousels and animations using external packages.
  - URL: https://jinteriorssr.netlify.app
`;

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
async function uploadToQdrant(
  chunks: string[],
  embeddings: number[][],
  source: string
) {
  const existingPoints = await qdrantClient.scroll(COLLECTION_NAME, {
    limit: 100,
    with_payload: true,
  });

  const maxId =
    existingPoints.points.length > 0
      ? Math.max(...existingPoints.points.map((p) => Number(p.id)))
      : -1;

  const points = chunks.map((chunk, index) => ({
    id: maxId + index + 1,
    vector: embeddings[index],
    payload: {
      text: chunk,
      source: source,
      timestamp: new Date().toISOString(),
    },
  }));

  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: points,
  });

  console.log(`Uploaded ${points.length} chunks from ${source} to Qdrant`);
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
    source: result.payload?.source,
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
    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return embeddings;
}

// Main runner function
async function run() {
  try {
    // UNCOMMENT BELOW TO UPLOAD DATA (run once)
    const text = await extractPdfText("Mani Resume.pdf");
    const chunks = await splitTextWithLangchain(text);
    console.log("Total PDF chunks:", chunks.length);

    // Split additional experience text
    const additionalChunks = await splitTextWithLangchain(
      ADDITIONAL_EXPERIENCE
    );
    console.log("Total additional chunks:", additionalChunks.length);

    // Create collection
    await createCollection();

    // Upload PDF resume
    console.log("\nUploading PDF resume...");
    const embeddings = await embedChunks(chunks, /* useOpenAI = */ false);
    await uploadToQdrant(chunks, embeddings, "Mani Resume.pdf");

    // Upload additional experience
    console.log("\nUploading additional experience...");
    const additionalEmbeddings = await embedChunks(
      additionalChunks,
      /* useOpenAI = */ false
    );
    await uploadToQdrant(
      additionalChunks,
      additionalEmbeddings,
      "Additional Professional Experience"
    );

    // Test search
    console.log("\n--- Testing Search ---");
    const results = await searchResume("what are the credentials for chat app");
    results.forEach((result, i) => {
      console.log(`\nResult ${i + 1} (score: ${result.score}):`);
      console.log(`Source: ${result.source}`);
      console.log(result.text);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute
run();
