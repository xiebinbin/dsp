import { Command, CommandRunner } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import { GenerateKey, Wallet } from '../../../utils/wallet';

@Command({ name: 'generate-key', options: { isDefault: true } })
export class GenerateKeyCommand extends CommandRunner {
  async run() {
    const priKey = GenerateKey();
    const wallet = new Wallet(priKey);
    const pubKey = wallet.getPubKey();
    const envPath = path.resolve(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf-8');
    const newEnv = env
      .replace(/SYSTEM_PRI_KEY=.*/, `SYSTEM_PRI_KEY="${priKey}"`)
      .replace(/SYSTEM_PUB_KEY=.*/, `SYSTEM_PUB_KEY="${pubKey}"`);
    fs.writeFileSync(envPath, newEnv);
    console.log('系统密钥已更新!');
  }
}
