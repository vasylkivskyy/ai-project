import {
  ComprehendClient,
  DetectSentimentCommand,
  DetectKeyPhrasesCommand,
  DetectEntitiesCommand,
} from "@aws-sdk/client-comprehend";

const comprehendClient = new ComprehendClient({ region: "eu-west-1" });

export const getInsightsFromComprehend = async (reviewText) => {
  const insights = {};

  try {
    const sentimentResponse = await comprehendClient.send(
      new DetectSentimentCommand({
        Text: reviewText,
        LanguageCode: "en",
      })
    );
    insights.sentiment = {
      sentiment: sentimentResponse.Sentiment,
      sentimentScore: sentimentResponse.SentimentScore,
    };

    const keyPhrasesResponse = await comprehendClient.send(
      new DetectKeyPhrasesCommand({
        Text: reviewText,
        LanguageCode: "en",
      })
    );
    insights.keyPhrases = keyPhrasesResponse.KeyPhrases.map(
      (phrase) => phrase.Text
    );

    const entitiesResponse = await comprehendClient.send(
      new DetectEntitiesCommand({
        Text: reviewText,
        LanguageCode: "en",
      })
    );
    insights.entities = entitiesResponse.Entities.map((entity) => ({
      text: entity.Text,
      type: entity.Type,
      score: entity.Score,
    }));

    return insights;
  } catch (error) {
    console.error("Error getting insights from Comprehend:", error);
    throw error;
  }
};
