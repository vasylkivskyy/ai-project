import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventBridgeClient = new EventBridgeClient();

export const sendEvent = async (source, detailType, detail) => {
  const eventBridgeParams = {
    Entries: [
      {
        EventBusName: "default",
        Source: source,
        DetailType: detailType,
        Detail: JSON.stringify(detail),
        Time: new Date(),
      },
    ],
  };

  const putEventsCommand = new PutEventsCommand(eventBridgeParams);
  await eventBridgeClient.send(putEventsCommand);
};
