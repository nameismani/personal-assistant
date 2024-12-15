import { MongoClient } from "mongodb";
import { DataAPIClient } from "@datastax/astra-db-ts";
import "dotenv/config";
// import OpenAI from "openai";

const MONGODB_URL = process.env.MONGODB_URL || ""; // Replace with your MongoDB URL
const MONGODB_DB = "Portfolio_embedings";
// const MONGODB_COLLECTION = "embeddings";

const mongoClient = new MongoClient(MONGODB_URL);
const mongoDBName = MONGODB_DB;
const mongoCollectionName = process.env.MONGODB_COLLECTION;

const astraClient = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const astraDB = astraClient.db(process.env.ASTRA_DB_API_ENDPOINT, {
  namespace: process.env.ASTRA_DB_NAMESPACE,
});

const createCollection = async () => {
  try {
    await astraDB.createCollection("portfolio", {
      vector: {
        dimension: 1536,
      },
    });
  } catch (error) {
    console.log("Collection already exists or failed to create:", error);
  }
};

const migrateData = async () => {
  try {
    await mongoClient.connect();
    const mongoDB = mongoClient.db(mongoDBName);
    const mongoCollection = mongoDB.collection(mongoCollectionName);

    const documents = await mongoCollection.find({}).toArray();
    console.log(`Found ${documents.length} documents in MongoDB.`);

    const astraCollection = await astraDB.collection("Portfolio");

    for (const doc of documents) {
      const { _id, content, embedding, metadata } = doc;

      try {
        // Insert into DataStax Astra DB
        const res = await astraCollection.insertOne({
          document_id: _id,
          $vector: embedding,
          content,
          metadata: metadata || {},
        });

        console.log(`Document with ID ${_id} migrated successfully:`, res);
      } catch (error) {
        console.error(`Failed to migrate document with ID ${_id}:`, error);
      }
    }

    console.log("Migration completed.");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await mongoClient.close();
  }
};

const startMigration = async () => {
  await createCollection();
  await migrateData();
};

startMigration();

//  code from Road side coader
// import {DataAPIClient} from "@datastax/astra-db-ts";
// import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
// import "dotenv/config";
// import OpenAI from "openai";
// import sampleData from "./sample-data.json" with {type: "json"};

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_KEY
// })

// const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN)
// const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
//     namespace:process.env.ASTRA_DB_NAMESPACE
// })

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 1000,
//   chunkOverlap: 200,
// });

// const createCollection =async () => {
//     try {
//         await db.createCollection("portfolio", {
//             vector: {
//                 dimension: 1536,
//             }
//         })
//     } catch (error) {
//         console.log("Collection Already Exists",error);
//     }
// }

// const loadData = async () => {
//     const collection = await db.collection("portfolio")
//     for await (const { id, info, description } of sampleData) {
//         const chunks = await splitter.splitText(description);
//         let i = 0;
//         for await (const chunk of chunks) {
//             const { data } = await openai.embeddings.create({
//                 input: chunk,
//                 model: "text-embedding-3-small"
//             })

//             const res = await collection.insertOne({
//                 document_id: id,
//                 $vector: data[0]?.embedding,
//                 info,
//                 description:chunk
//             })

//             i++
//         }
//     }

//     console.log("data added");
// }

// createCollection().then(()=>loadData())
