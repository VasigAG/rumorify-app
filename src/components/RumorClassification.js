import { v4 as uuidv4 } from 'uuid';

export const classifyRumor = (newRumorText, existingRumors) => {
  const BASE_SIMILARITY_THRESHOLD = 0.25;

  // Basic implementation of tokenize function
  const tokenize = (text) => {
    return text.toLowerCase().split(/\s+/);
  };

  // Basic implementation of calculateSimilarity function
  const calculateSimilarity = (text1, text2) => {
    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);
    
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  // Calculate dynamic threshold based on the number of words in the new rumor
  const newRumorWordCount = tokenize(newRumorText).length;
  const similarityThreshold = BASE_SIMILARITY_THRESHOLD + (newRumorWordCount * 0.01); // Adjust the multiplier as needed

  let mostSimilarRumor = null;
  let highestSimilarity = 0;

  for (const rumor of existingRumors) {
    const similarity = calculateSimilarity(newRumorText, rumor.content);
    if (similarity > highestSimilarity && similarity >= similarityThreshold) {
      highestSimilarity = similarity;
      mostSimilarRumor = rumor;
    }
  }

  if (mostSimilarRumor) {
    return {
      type: highestSimilarity > 0.8 ? 'different wording' : 'slightly varying',
      variations: true,
      referenceId: mostSimilarRumor.referenceId,
      existingRumorId: mostSimilarRumor.id
    };
  } else {
    return {
      type: 'new',
      variations: false,
      referenceId: uuidv4(),
      existingRumorId: null
    };
  }
};
