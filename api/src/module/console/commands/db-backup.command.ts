import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
@Command({ name: 'db-backup', options: { isDefault: true } })
export class DbBackupCommand extends CommandRunner {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async run() {
    const host = this.config.get('DB_HOST');
    const port = this.config.get('DB_PORT');
    const user = this.config.get('DB_USER');
    const pwd = this.config.get('DB_PASSWORD');
    const db = this.config.get('DB_DATABASE');
    const date = dayjs().format('YYYY-MM-DD-HH-mm-ss');
    const dir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const cmd = `mysqldump -u${user} -p${pwd} --host=${host} --port=${port} ${db} > ${dir}/${date}.sql`;
    exec(cmd, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('数据库备份成功');
      }
    });
  }
}
