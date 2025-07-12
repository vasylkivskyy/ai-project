import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient();

export const saveReviewItems = async (reviews) => {
  for (const review of reviews) {
    const reviewItem = {
      TableName: "parsed-reviews",
      Item: marshall({
        Id: uuidv4(),
        ...review,
      }),
    };
    await dynamoDBClient.send(new PutItemCommand(reviewItem));
  }
};

export const saveMetadataItem = async (
  fileName,
  bucketName,
  numberOfReviews
) => {
  const metadataItem = {
    TableName: "parsing-metadata",
    Item: marshall({
      Id: uuidv4(),
      fileName,
      bucketName,
      numberOfReviews,
      processingDate: new Date().toISOString(),
    }),
  };
  await dynamoDBClient.send(new PutItemCommand(metadataItem));
};
