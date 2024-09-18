// src/components/SummaryGenerator.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyAznIKpJEmZ9ru36Vyg4WkAycaFcl0Yyos');

export const generateSummary = async (referenceId, rumor) => {
  const maxRetries = 4; // Number of retries before giving up
  const retryDelay = 2000; // Delay between retries in milliseconds

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summaryText = await response.text();
      return summaryText.trim() || "Unable to generate a summary from the available content.";
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
