export const getS3EventFromSqs = async (event) => {
  const sqsMessage = event.Records[0];
  return JSON.parse(sqsMessage.body);
};

export const getS3Details = (s3Event) => {
  const bucket = s3Event.detail.bucket.name;
  const key = s3Event.detail.object.key;
  return { bucket, key };
};
