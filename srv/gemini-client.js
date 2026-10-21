import { GoogleGenAI } from "@google/genai";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      const isUnavailable =
        error?.status === 503 ||
        error?.code === 503 ||
        error?.message?.includes("503") ||
        error?.message?.includes("UNAVAILABLE");

      if (!isUnavailable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);

      await sleep(delay);
    }
  }
};

export const geminiClient = {
  generateWeeklySummary: generateWithRetry,
};
