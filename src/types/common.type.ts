// Task Types Explained:
// RETRIEVAL_DOCUMENT: Use when embedding documents to store in database (what you're doing during upload)

// RETRIEVAL_QUERY: Use when embedding user queries for search (what you're doing during search)

// SEMANTIC_SIMILARITY: Use for comparing similarity between texts

// CLASSIFICATION: Use for text classification tasks

// CLUSTERING: Use for grouping similar documents

type TaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY"
  | "SEMANTIC_SIMILARITY"
  | "CLASSIFICATION"
  | "CLUSTERING";
