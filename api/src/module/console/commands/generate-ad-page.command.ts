import { Command, CommandRunner } from 'nest-commander';
import path from 'path';
import fs from 'fs';
import Handlebars from "handlebars";
import { MaterialService } from '../services/material.service';
import sqids from '../../../utils/sqids';
import { FileService } from '../services/file.service';
import CryptoJS from 'crypto-js';
import { TimeCurvePlacementByDayService } from '../services/time-curve-placement-by-day.service';
@Command({ name: 'generate-ad-page', options: { isDefault: true } })
export class GenerateAdPageCommand extends CommandRunner {
  constructor(
    private readonly materialService: MaterialService,
    private fileService: FileService,
    private readonly timeCurvePlacementByDayService: TimeCurvePlacementByDayService,
  ) {
    super();
  }
  async run() {
    const x = await this.timeCurvePlacementByDayService.getInfo(BigInt(359),'2024-01-07');
    console.log('x',x);
    // const templateContent = fs.readFileSync(path.join(process.cwd(), 'views', 'empty-ad.hbs'), 'utf-8');
    // const template = Handlebars.compile(templateContent);
    // const result = await this.materialService.getList(1, 1000);
    // for (let index = 0; index < result.data.length; index++) {
    //   const item = result.data[index];
    //   const hashId = sqids.en(Number(item.id)).toLowerCase();

    //   const key = path.join('pages', 's', hashId + '.html');
    //   const htmlPath = path.join(process.cwd(), key);
    //   const htmlContent = template({
    //     analytics_js: item.analyticJs,
    //   });
    //   const md5 = CryptoJS.MD5(htmlContent).toString();
    //   if (md5 == item.adPageMd5 && fs.existsSync(htmlPath)) {
    //     console.log('skip generate ad page', htmlPath);
    //     continue;
    //   }
    //   fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
    //   fs.writeFileSync(htmlPath, htmlContent);
    //   await this.fileService.delFile(key);
    //   await this.fileService.upload(htmlPath);
    //   console.log('generate ad page', key);
    //   await this.materialService.updateAdPageMd5(item.id, md5);
    // }
  }
}
