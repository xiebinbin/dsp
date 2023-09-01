import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';

export interface ClientConfig {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly config: ClientConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      bucket: this.configService.get('S3_BUCKET') as string,
      endpoint: this.configService.get('S3_ENDPOINT') as string,
      region: this.configService.get('S3_REGION') as string,
      accessKeyId: this.configService.get('S3_ACCESS_KEY_ID') as string,
      secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY') as string,
    };
    this.client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async updateBucketCors() {
    const corsParams = {
      Bucket: this.config.bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag', 'Content-Length'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    };
    const command = new PutBucketCorsCommand(corsParams);
    return await this.client.send(command);
  }

  async getBucketCors() {
    const corsParams = {
      Bucket: this.config.bucket,
    };
    return await this.client.send(new GetBucketCorsCommand(corsParams));
  }

  async getPutObjectUrl(ext: string) {
    const id = uuidv4().toString().toLowerCase().replace(/-/g, '');
    const key = path.join(
      'tmp',
      id.slice(0, 2),
      id.slice(2, 4),
      id.slice(4, 6),
      id + '.' + ext,
    );
    const contentType = mime.lookup('.' + ext);
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType:
        contentType == false ? 'application/octet-stream' : contentType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: 600 });
    return {
      url,
      key,
    };
  }

  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });
    return await this.client.send(command);
  }
  async copyObject(key: string, toKey: string) {
    const { bucket } = this.config;
    const command = new CopyObjectCommand({
      Bucket: bucket,
      Key: toKey,
      CopySource: `${bucket}/${key}`,
    });
    return await this.client.send(command);
  }
}
