"use server";

export const fetchAIResponse = async (query: string): Promise<string> => {
  console.log("click", query);
  try {
    const response = await fetch("http://localhost:3000/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }).then((res) => res.json());
    return response.content;
  } catch (err: any) {
    console.log(err);
    return err?.message;
  }
};
