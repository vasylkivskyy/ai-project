import { getEmbeddingFromBedrock } from "./bedrockService.js";
import { getInsightsFromComprehend } from "./comprehendService.js";

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const reviewText = message.dynamodb.NewImage.Text.S;

      console.log("Received message:", record.body);
      console.log("Review text:", reviewText);

      const embedding = await getEmbeddingFromBedrock(reviewText);
      console.log("Embedding:", embedding);

      const insights = await getInsightsFromComprehend(reviewText);
      console.log("Insights from Comprehend:", insights);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Data transformation completed successfully",
      }),
    };
  } catch (error) {
    console.error("Error during data transformation:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error during data transformation" }),
    };
  }
};
