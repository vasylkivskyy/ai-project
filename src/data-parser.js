import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import csv from "csv-parser";

const s3Client = new S3Client();
const eventBridgeClient = new EventBridgeClient();

export const handler = async (event) => {
  console.log("Data parsing event received");

  const sqsMessage = event.Records[0];
  const s3EventMessage = JSON.parse(sqsMessage.body);

  const detailType = s3EventMessage["detail-type"];
  console.log("Detail Type:", detailType);

  const bucket = s3EventMessage.detail.bucket.name;
  const key = s3EventMessage.detail.object.key;

  console.log("Bucket:", bucket);
  console.log("Key:", key);

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const stream = response.Body;
    const rows = [];

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    console.log("Parsed CSV data:", rows);

    const eventBridgeParams = {
      Entries: [
        {
          EventBusName: "default",
          Source: "custom.dataParser",
          DetailType: "FILE_PARSED",
          Detail: JSON.stringify({
            message: "File processed successfully",
            bucket: bucket,
            key: key,
            rowsProcessed: rows.length,
          }),
          Time: new Date(),
        },
      ],
    };

    const putEventsCommand = new PutEventsCommand(eventBridgeParams);
    await eventBridgeClient.send(putEventsCommand);

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
