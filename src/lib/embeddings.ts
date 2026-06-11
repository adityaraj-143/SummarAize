import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  try {
    const requests = texts.map((text) => ({
      content: { role: "user", parts: [{ text: text.replace(/\n/g, "") }] },
    }));

    const response = await model.batchEmbedContents({
      requests,
    });

    if (!response.embeddings) {
      throw new Error("Embeddings not returned by the API");
    }

    return response.embeddings
      .map((e) => e.values.slice(0, 2048))
      .filter((v): v is number[] => Array.isArray(v));
  } catch (error) {
    console.error("Error calling Gemini embeddings API:", error);
    throw error;
  }
}
