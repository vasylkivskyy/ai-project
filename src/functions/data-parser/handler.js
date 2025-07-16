import { getObjectFromS3 } from "./s3Service.js";
import { parseCsv } from "../../utils/csvParser.js";
import { getS3EventFromSqs, getS3Details } from "./sqsService.js";
import {
  saveReviewItems,
  saveMetadataItem,
} from "../../utils/dynamoDbService.js";
import { sendEvent } from "../../utils/eventBridgeService.js";

export const handler = async (event) => {
  console.log("Data parsing event received");
  try {
    const s3Event = await getS3EventFromSqs(event);
    const { bucket, key } = getS3Details(s3Event);
    console.log("Bucket:", bucket);
    console.log("Key:", key);

    const csvData = await getObjectFromS3(bucket, key);
    const reviews = await parseCsv(csvData);

    console.log("Parsed CSV data:", reviews);
    await saveReviewItems(reviews);
    console.log("reviews saved in db");
    await saveMetadataItem(key, bucket, reviews.length);
    console.log("metadata saved in db");

    await sendEvent("custom.dataParser", "FILE_PARSED", {
      message: "File processed successfully",
      bucket,
      key,
      rowsProcessed: reviews.length,
    });
    console.log("event sended");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "CSV file processed successfully" }),
    };
  } catch (error) {
    console.error("Error processing CSV file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing CSV file" }),
    };
  }
};
