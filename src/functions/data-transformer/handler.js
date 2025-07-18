import { getEmbeddingFromBedrock } from "./bedrockService.js";
import { getInsightsFromComprehend } from "./comprehendService.js";
import { saveToPostgreSQL } from "./postgresService.js";
import { sendEvent } from "../../utils/eventBridgeService.js";

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const reviewText = message.dynamodb.NewImage.Text.S;
      const reviewId = message.dynamodb.NewImage.Id.S;

      console.log("Received message:", record.body);
      console.log("Review text:", reviewText);

      const [embedding, insights] = await Promise.all([
        getEmbeddingFromBedrock(reviewText),
        getInsightsFromComprehend(reviewText),
      ]);

      console.log("Embedding generated:", embedding);
      console.log("Insights generated:", insights);

      await saveToPostgreSQL(reviewId, reviewText, embedding, insights);

      await sendEvent("custom.dataTransformer", "DATA_TRANSFORMED", insights);
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
