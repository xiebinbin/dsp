import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../../../services/prisma.service';
import csv from 'csvtojson';
@Command({ name: 'import-postion', options: { isDefault: true } })
export class ImportPostionCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async run() {
    // 读取csv
    const csvFilePath = './test.csv';
    const items = await csv().fromFile(csvFilePath);
    for (const item of items) {
      const spec = await this.prisma.adSpec.findFirst({
        where: {
          name: item.spec,
        },
      });
      if (!spec) {
        console.log('spec not found');
        continue;
      }
      const media = await this.prisma.adMedia.findFirst({
        where: {
          type: 1,
          name: item.site,
        },
      });
      if (!media) {
        console.log('media not found', item.site);
        continue;
      }
      const position = await this.prisma.adPosition.findFirst({
        where: {
          name: item.name,
        },
      });
      if (position) {
        console.log('position already exists', item.name);
        continue;
      }
      await this.prisma.adPosition.create({
        data: {
          name: item.name,
          adSpecId: spec.id,
          adMediaId: media.id,
          type: 1,
        },
      });

    }
  }
}
