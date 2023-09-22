import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { FileDto } from '../dto/file.dto';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(
    private httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getToken(fileName: string): Promise<any> {
    const accessKey = this.config.get('ACCESSKEY');
    const secretKey = this.config.get('SECRETKEY');
    const bucket = this.config.get('BUCKET'); // 存储空间名称
    const key = fileName; //'abc/123.jpg';
    console.log('config accesskey', accessKey);
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
      const response = await lastValueFrom(
        this.httpService
          .post(`https://api.dogecloud.com${apiUrl}`, bodyJSON, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authorization,
            },
          })
          .pipe(
            map((response) => {
              return response.data;
            }),
          ),
      );
      if (response.code !== 200) {
        throw new Error(`API Error: ${response.msg}`);
      }

      const data = response.data;
      const ret = {
        credentials: data.Credentials,
        s3Bucket: data.Buckets[0].s3Bucket,
        s3Endpoint: data.Buckets[0].s3Endpoint,
        keyPrefix: key,
      };
      console.log('fileret', ret);
      return ret;
    } catch (error) {
      throw error;
    }
  }
  async upload(param: FileDto, fileurl: string) {
    const file = fs.readFileSync(fileurl);

    // console.log('update file ', file);
    const { credentials, s3Bucket, s3Endpoint, keyPrefix } = param;
    console.log('param', param);
    const s3client = new AWS.S3({
      // 用服务端返回的信息初始化一个 S3 实例
      region: 'automatic',
      endpoint: s3Endpoint,
      credentials: credentials,
      params: {
        Bucket: s3Bucket,
      },
    });
    const s3Upload = s3client.upload({
      Key: keyPrefix,
      Body: file,
      Bucket: s3Bucket,
      // ContentType: file, // 设置上传后文件的 Content-Type 头，即 MIME 类型
    });
    s3Upload.on(
      'httpUploadProgress',
      (evt: { loaded: number; total: number }) => {
        // 上传进度回调函数
        const percent = ((evt.loaded * 100) / evt.loaded).toFixed(2);
        console.log('进度 : ' + percent + '%');
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s3send = await s3Upload.send((err: any, data: any) => {
      if (err) {
        console.log(err);
        return false;
      } else {
        // console.log('JSON.stringify(data)', JSON.stringify(data));
        return JSON.stringify(data);
        // size: file.size,
      }
    });
    console.log('s3send', s3send);
    return s3send;
  }
  async generateRandomFileName(originalName: string): Promise<string> {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const fileExt = extname(originalName);
    return `${randomName}${fileExt}`;
  }
}
