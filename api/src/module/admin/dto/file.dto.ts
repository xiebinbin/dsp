import { IsNotEmpty } from 'class-validator';
export interface FileDto {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  };
  s3Bucket: string;
  s3Endpoint: string;
  keyPrefix: string;
}
