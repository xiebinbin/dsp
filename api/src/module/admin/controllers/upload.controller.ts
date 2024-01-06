import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import moment from 'moment';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import * as fs from 'fs';
import { FileService } from '../services/file.service';
import { v4 } from 'uuid';

@Controller('api/admin/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly fileService: FileService) {}
  defaultUrl = 'https://cdn.adbaba.net/';
  @UseInterceptors(ApiResInterceptor)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const date = moment().format('YYYY-MM-DD');
          const uploadPath = `../uploads/${date}/`;
          fs.mkdirSync(uploadPath, { recursive: true });
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileExt = extname(file.originalname);
          callback(null, `${randomName}${fileExt}`);
        },
      }),
    }),
  )
  @UseInterceptors(ApiResInterceptor)
  @Post('/push')
  async uploadFile(
    @Res() response,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ filename: string; fileurl: string; mimetype: string }> {
    if (file) {
      console.log(
        `File "${file.filename}" uploaded successfully to ${file.destination}.`,
      );
      const key = v4().replace('-', '');
      //   console.log('文件类型', file.type, mimeTypes.extension(file.type));
      const ext = extname(file.originalname).toLowerCase();
      const fileName = [
        key.substring(0, 2),
        key.substring(2, 4),
        key + ext,
      ].join('/');
      const res = await this.fileService.getToken(fileName);
      await this.fileService.upload(
        res,
        file.destination + file.filename,
      );
      const responseData = {
        data: { fileurl: this.defaultUrl + res.keyPrefix },
        code: 200,
      };
      console.log('gettoken', responseData);
      return response.send(responseData);
    } else {
      throw new Error('File upload failed.');
    }
  }
  //   @Post('/uploadcloud')
  //   @UseInterceptors(ApiResInterceptor)
  //   async getToken(
  //     @Res() response,
  //     @Body() file: { filename: string; fileurl: string; filemimetype: string },
  //   ): Promise<FileDto> {
  //     console.log('filetoken', file);
  //     try {
  //       const key = v4().replace('-', '');
  //       //   console.log('文件类型', file.type, mimeTypes.extension(file.type));

  //       const fileName = [
  //         key.substring(0, 2),
  //         key.substring(2, 4),
  //         key + '.' + file.filemimetype,
  //       ].join('/');
  //       const res = await this.fileService.getToken(fileName);
  //       const sendfile = await this.fileService.upload(res, file.fileurl);
  //       console.log('sendfile', sendfile);
  //       const responseData = {
  //         data: { data: res },
  //         code: 200,
  //       };
  //       console.log('gettoken', responseData);
  //       return response.send(responseData);
  //       return res;
  //     } catch (e) {
  //       console.log(e);
  //       throw new HttpException(e.message, e.status);
  //     }
  //   }
}
