import {
  ComprehendClient,
  DetectSentimentCommand,
  DetectKeyPhrasesCommand,
  DetectEntitiesCommand,
} from "@aws-sdk/client-comprehend";

const comprehendClient = new ComprehendClient({ region: "eu-west-1" });

async function detectSentiment(text, languageCode) {
  try {
    const command = new DetectSentimentCommand({
      Text: text,
      LanguageCode: languageCode,
    });

    const response = await comprehendClient.send(command);

    return {
      sentiment: response.Sentiment,
      sentimentScore: response.SentimentScore,
    };
  } catch (error) {
    console.error("Error detecting sentiment:", error);
    return null;
  }
}

async function detectKeyPhrases(text, languageCode) {
  try {
    const command = new DetectKeyPhrasesCommand({
      Text: text,
      LanguageCode: languageCode,
    });

    const response = await comprehendClient.send(command);

    return response.KeyPhrases.map((phrase) => phrase.Text);
  } catch (error) {
    console.error("Error detecting key phrases:", error);
    return [];
  }
}

async function detectEntities(text, languageCode) {
  try {
    const command = new DetectEntitiesCommand({
      Text: text,
      LanguageCode: languageCode,
    });

    const response = await comprehendClient.send(command);

    return response.Entities.filter((entity) => entity.Score > 0.5).map(
      (entity) => ({
        text: entity.Text,
        type: entity.Type,
        score: entity.Score,
      })
    );
  } catch (error) {
    console.error("Error detecting entities:", error);
    return [];
  }
}

export const getInsightsFromComprehend = async (reviewText) => {
  try {
    const [sentiment, keyPhrases, entities] = await Promise.all([
      detectSentiment(reviewText, "en"),
      detectKeyPhrases(reviewText, "en"),
      detectEntities(reviewText, "en"),
    ]);

    const insights = {
      sentiment,
      keyPhrases,
      entities,
    };

    return insights;
  } catch (error) {
    console.error("Error getting insights from Comprehend:", error);
    throw error;
  }
};
