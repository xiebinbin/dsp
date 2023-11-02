import {
  Command,
  CommandRunner,
  InquirerService,
  Question,
  QuestionSet,
} from 'nest-commander';
import { ReportService } from '../services/report.service';

@QuestionSet({ name: 'execute-query-questions' })
export class ExecuteQueryQuestions {
  @Question({
    message: '请输入查询条件 (例如：日期范围、过滤条件等):',
    name: 'queryCondition',
  })
  parseQueryCondition(value: string) {
    return value.trim();
  }
}

@Command({ name: 'execute-query', options: { isDefault: false } })
export class ExecuteQueryCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    private readonly reportService: ReportService,
  ) {
    super();
  }

  async run() {
    const options = await this.inquirer.ask<{
      queryCondition: string;
    }>('execute-query-questions', undefined);

    // 调用 ReportService 执行查询
    const queryResult = await this.reportService.executeQuery(
      options.queryCondition,
    );

    if (queryResult) {
      console.log('查询结果:');
      console.log(queryResult);
    } else {
      console.log('未找到匹配的数据.');
    }
  }
}
