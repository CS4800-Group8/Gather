// AnN add: S3 upload utility for recipe photos on 10/28
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload a file to S3 bucket
 * @param file - File buffer to upload
 * @param fileName - Name for the file in S3
 * @param contentType - MIME type of the file (e.g., 'image/jpeg')
 * @returns Public URL of the uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.AWS_BUCKET_NAME!;

  // Create upload command
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName, // File name in S3
    Body: file,
    ContentType: contentType,
  });

  // Upload to S3
  await s3Client.send(command);

  // Return public URL (assumes bucket has public read access)
  const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  
  return publicUrl;
}