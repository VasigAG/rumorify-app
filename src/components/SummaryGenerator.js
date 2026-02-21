// src/components/SummaryGenerator.js
import { GoogleGenAI } from "@google/genai";

export const generateSummary = async (referenceId, rumor) => {
  // Use REACT_APP_GEMINI_API_KEY from environment, or check localStorage if present (for user flexibility)
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');

  if (!apiKey) {
    return rumor.content.substring(0, 50) + "..."; // Fallback to truncated content if no API key
  }

  const ai = new GoogleGenAI(apiKey);

  const maxRetries = 4; // Number of retries before giving up
  const retryDelay = 2000; // Delay between retries in milliseconds

  const allRumorTexts = [
    rumor.content,
    ...rumor.variations.map(v => v.content),
    ...rumor.similarSubmissions.map(s => s.content)
  ].filter(Boolean);

  if (allRumorTexts.length === 0) {
    return "No rumor content available for summarization.";
  }

  const prompt = `Summarize the following rumors:
                  ${allRumorTexts.join('\n')}
                  Provide a concise summary that captures the core details and any significant variations.
                  Limit the summary to 5 to 7 words. Need it to be all lowercaps and informal with emojis. Don't say things that are not related to the inputted sentence`;

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      // Use the new SDK method
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash", // Using gemini-1.5-flash as the "flash" model, since gemini-3 is not standard yet or might be gemini-1.5-flash-latest
        contents: prompt,
      });
      return response.text().trim() || "Unable to generate a summary.";
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt += 1;
      if (attempt >= maxRetries) {
        return `Unable to generate summary: ${error.message}. Please try again later.`;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay)); // Wait before retrying
    }
  }
};
