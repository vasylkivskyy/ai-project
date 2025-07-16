import { saveCachedData } from "../../utils/dynamoDbService.js";

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);

      console.log("Received message for caching: ", message);
      const { detail } = message;
      const { sentiment, keyPhrases, entities } = detail;

      const cachedData = {
        id: message.id,
        sentiment,
        keyPhrases,
        entities,
      };

      await saveCachedData(cachedData);

      console.log(`Data cached successfully for event ID: ${message.id}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Data caching completed successfully",
      }),
    };
  } catch (error) {
    console.error("Error during data caching:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error during data caching" }),
    };
  }
};
