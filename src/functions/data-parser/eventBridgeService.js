import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventBridgeClient = new EventBridgeClient();

export const sendEvent = async (bucket, key, rowsProcessed) => {
  const eventBridgeParams = {
    Entries: [
      {
        EventBusName: "default",
        Source: "custom.dataParser",
        DetailType: "FILE_PARSED",
        Detail: JSON.stringify({
          message: "File processed successfully",
          bucket,
          key,
          rowsProcessed,
        }),
        Time: new Date(),
      },
    ],
  };

  const putEventsCommand = new PutEventsCommand(eventBridgeParams);
  await eventBridgeClient.send(putEventsCommand);
};
