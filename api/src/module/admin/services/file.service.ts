import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

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

      const body = JSON.parse(response);
      if (body.code !== 200) {
        throw new Error(`API Error: ${body.msg}`);
      }

      const data = body.data;
      const ret = {
        credentials: data.Credentials,
        s3Bucket: data.Buckets[0].s3Bucket,
        s3Endpoint: data.Buckets[0].s3Endpoint,
        keyPrefix: key,
      };

      return ret;
    } catch (error) {
      throw error;
    }
  }
}
