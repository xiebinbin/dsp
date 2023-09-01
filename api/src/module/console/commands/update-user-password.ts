import {
  Command,
  CommandRunner,
  InquirerService,
  Question,
  QuestionSet,
} from 'nest-commander';
import { UserService } from '../services/user.service';

@QuestionSet({ name: 'update-user-password-questions' })
export class UpdateRootUserPasswordQuestions {
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

  @Question({
    message: '请输入登录密码:',
    validate: (value: string) => {
      if (value.trim().length < 4) {
        return '登录口令长度不能小于4';
      }
      return true;
    },
    name: 'password',
  })
  parsePassword(value: string) {
    return value.trim();
  }
}

@Command({ name: 'update-user-password', options: { isDefault: true } })
export class UpdateUserPasswordCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async run() {
    const options = await this.inquirer.ask<{
      username: string;
      password: string;
    }>('update-user-password-questions', undefined);
    // 判断用户是否存在
    const user = await this.userService.findByUsername(options.username);
    if (!user) {
      console.log('用户不存在');
      return;
    }
    await this.userService.updatePassword(user.id, options.password);
    console.log('用户口令更新成功');
  }
}
