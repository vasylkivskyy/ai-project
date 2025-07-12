import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client();

export const getObjectFromS3 = async (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);

  return response.Body;
};
