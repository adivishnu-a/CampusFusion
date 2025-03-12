import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

type UserType = "teachers" | "students" | "admins" | "parents";

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  userType: UserType
) {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: `${userType}/${fileName}`,
    Body: file,
    ContentType: contentType,
    ACL: "public-read",
  });
  try{
    await s3Client.send(command);
    return `https://${process.env.BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${userType}/${fileName}`;
  }
  catch (err) {
    console.error("Error uploading object to S3:", err);
    return null;
  }
}

export async function deleteObjectFromS3( userType:UserType, fileName:string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: `${userType}/${fileName}`,
  });
  try{
    await s3Client.send(command);
    console.log("Deleted ${userType} ${userName} profile image on S3 with file name ${fileName}");
  }
  catch (err) {
    console.error("Error uploading object to S3:", err);
    return null;
  }
}
