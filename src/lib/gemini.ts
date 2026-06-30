import { digitalSummaryPrompt, scannedSummaryPrompt, combineSummaryPrompt } from "@/utils/Pompt";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

async function generate(prompt: string, text: string) {
  const result = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: [
      {
        role: "user",
        parts: [{ text: `${prompt}\n\n${text}` }],
      },
    ],
    config: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  });
  return result.text;
}

export async function FetchSummary(pdfText: string, pdfType: "digital" | "scanned" = "digital") {
  const prompt = pdfType === "scanned" ? scannedSummaryPrompt : digitalSummaryPrompt;
  try {
    const text = await generate(prompt, pdfText);
    console.log(text);
    return text;
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 429) {
      throw new Error("Rate limit exceeded");
    }
    console.error("Gemini API Error: ", error);
    throw error;
  }
}

export async function combineSummaries(
  partialSummaries: string[],
  pdfType: "digital" | "scanned" = "digital",
) {
  const prompt =
    pdfType === "scanned"
      ? `The following are OCR-based summaries. ${combineSummaryPrompt}`
      : combineSummaryPrompt;

  const combinedText = partialSummaries
    .map((s, i) => `### Summary of Part ${i + 1}\n\n${s}`)
    .join("\n\n");

  try {
    const text = await generate(prompt, combinedText);
    console.log(text);
    return text;
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 429) {
      throw new Error("Rate limit exceeded");
    }
    console.error("Gemini API Error: ", error);
    throw error;
  }
}
