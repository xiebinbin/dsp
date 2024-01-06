import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class FileService {
  constructor(
    private readonly config: ConfigService,
  ) { }

  async getToken(key: string): Promise<any> {
    const accessKey = this.config.get('ACCESSKEY');
    const secretKey = this.config.get('SECRETKEY');
    const bucket = this.config.get('BUCKET');
    const bodyJSON = JSON.stringify({
      channel: 'OSS_UPLOAD',
      scopes: [`${bucket}:${key}`],
    });

    const apiUrl = '/auth/tmp_token.json';
    const signStr = `${apiUrl}\n${bodyJSON}`;
    const sign = crypto
      .createHmac('sha1', secretKey)
      .update(Buffer.from(signStr, 'utf8'))
      .digest('hex');
    const authorization = `TOKEN ${accessKey}:${sign}`;

    try {
      const rep = await fetch('https://api.dogecloud.com/auth/tmp_token.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
        body: bodyJSON,
      })
      const response = await rep.json();
      if (response.code !== 200) {
        throw new Error(`API Error: ${response.msg}`);
      }

      const data = response.data;
      const ret = {
        credentials: data.Credentials,
        s3Bucket: data.Buckets[0].s3Bucket,
        s3Endpoint: data.Buckets[0].s3Endpoint,
      };
      return ret;
    } catch (error) {
      throw error;
    }
  }
  async delFile(key: string) {
    const param = await this.getToken(key);
    const { credentials, s3Bucket, s3Endpoint } = param;
    const s3client = new AWS.S3({
      region: 'automatic',
      endpoint: s3Endpoint,
      credentials: credentials,
      params: {
        Bucket: s3Bucket,
      },
    });
    const s3Delete = s3client.deleteObject({
      Key: key,
      Bucket: s3Bucket,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s3send = await s3Delete.send((err: any, data: any) => {
      if (err) {
        console.log(err);
        return false;
      } else {
        return s3send;
      }
    });
    return s3send;  
  }
  async upload(filePath: string) {
    const file = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const key = `/pages/s/${fileName}`;
    const param = await this.getToken(key);
    const { credentials, s3Bucket, s3Endpoint } = param;
    const s3client = new AWS.S3({
      region: 'automatic',
      endpoint: s3Endpoint,
      credentials: credentials,
      params: {
        Bucket: s3Bucket,
      },
    });
    const s3Upload = s3client.upload({
      Key: key,
      Body: file,
      Bucket: s3Bucket,
      ContentType: 'text/html',
    });
    s3Upload.on(
      'httpUploadProgress',
      (evt: { loaded: number; total: number }) => {
        // 上传进度回调函数
        const percent = ((evt.loaded * 100) / evt.loaded).toFixed(2);
        console.log('进度 : ' + percent + '%');
      },
    );
    const s3send = await s3Upload.send((err: any, data: any) => {
      if (err) {
        console.log(err);
        return false;
      } else {
        console.log('s3send', s3send);
        return s3send;
      }
    });
    console.log('s3send', s3send);
    return s3send;
  }
}
