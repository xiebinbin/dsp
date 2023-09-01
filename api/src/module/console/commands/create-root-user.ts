import {
  Command,
  CommandRunner,
  InquirerService,
  Question,
  QuestionSet,
} from 'nest-commander';
import { UserService } from '../services/user.service';

@QuestionSet({ name: 'create-root-user-questions' })
export class CreateRootUserQuestions {
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

interface CreateRootUserOptions {
  username: string;
  password: string;
}

@Command({ name: 'create-root-user', options: { isDefault: true } })
export class CreateRootUserCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async run() {
    const options = await this.inquirer.prompt<CreateRootUserOptions>(
      'create-root-user-questions',
      undefined,
    );
    // 判断用户是否存在
    const old = await this.userService.findByUsername(options.username);
    if (old) {
      console.error('用户已存在');
      return;
    }
    const user = await this.userService.create(
      options.username,
      options.password,
    );
    console.log('用户创建成功', user);
  }
}
