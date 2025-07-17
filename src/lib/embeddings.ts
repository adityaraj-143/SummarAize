import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
    try {
        const contents = texts.map(text => ({
            role: 'user',
            parts: [{ text: text.replace(/\n/g, '') }]
        }));

        const response = await ai.models.embedContent({
            model: 'gemini-embedding-exp-03-07',
            contents,
            config: {
                outputDimensionality: 2048
            }
        });

        console.log("RESPONSE: ",response);

        if (!response.embeddings) {
            throw new Error("Embeddings not returned by the API");
        }

        // Filter out undefined values safely
        return response.embeddings
          .map(e => e.values)
          .filter((v): v is number[] => Array.isArray(v));

    } catch (error) {
        console.error("Error calling Gemini embeddings API:", error);
        throw error;
    }
}
