import { pdfSummaryPrompt } from "@/utils/Pompt";
import { GoogleGenAI, Models } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function FetchSummary(pdfText: String) {
  try {
    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            { text: pdfSummaryPrompt },
            {
              text: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting\n\n ${pdfText}`,
            },
          ],
        },
      ],
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                pdfSummaryPrompt +
                "\n\n" +
                `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting\n\n${pdfText}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    console.log(result.text);
    return result.text;
  } catch (error: any) {
    if (error.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    console.error("Gemini API Error: ", error);
    throw error;
  }
}
