import {
    Command,
    CommandRunner,
    InquirerService,
    Question,
    QuestionSet,
  } from 'nest-commander';
import { AdvertiserService } from '../services/advertiser.service';
  
  @QuestionSet({ name: 'clear-adv-data-question' })
  export class ClearAdvDataQuestion {
    @Question({
      message: '请输入用户名:',
      validate: (value: string) => {
        if (value.trim().length < 2) {
          return '用户名长度不能小于2';
        }
        // 验证用户名只能为英文开头 不包含特殊字符
        if (!/^[a-zA-Z][a-zA-Z0-9_]{1,15}$/.test(value)) {
          return '用户名只能为英文开头 不包含特殊字符';
        }
        return true;
      },
      name: 'username',
    })
    parseUsername(value: string) {
      return value.trim().toLowerCase();
    }
  }
  
  interface ClearAdvDataOption {
    username: string;
  }
  
  @Command({ name: 'clear-adv-data', options: { isDefault: true } })
  export class ClearAdvDataCommand extends CommandRunner {
    constructor(
      private readonly inquirer: InquirerService,
      private readonly advertiserService: AdvertiserService,
    ){
      super();
    }
  
    async run() {
      const option = await this.inquirer.prompt<ClearAdvDataOption>(
        'clear-adv-data-question',
        undefined,
      );
      const adv = await this.advertiserService.findByUsername(option.username);
      if (!adv) {
        console.log('未找到匹配的数据.');
        return;
      }
      // 删除充值记录
      await this.advertiserService.clearWalletData(adv.id)
      console.log('删除充值记录成功');
      await this.advertiserService.ClearAdData(adv.id)
      console.log('删除广告数据成功');
    }
  }
  