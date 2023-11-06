import { Command, CommandRunner, InquirerService } from 'nest-commander';
import { ReportService } from '../services/report.service';

// @QuestionSet({ name: 'execute-query-questions' })
// export class CalculateReportDailyQuestions {
//   @Question({
//     message: '请输入查询条件 (例如：日期范围格式是 2023-01-02):',
//     name: 'queryCondition',
//   })
//   parseQueryCondition(value: string) {
//     return value.trim();
//   }
// }

@Command({ name: 'execute-calculate', options: { isDefault: false } })
export class CalculateReportDailyCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    private readonly reportService: ReportService,
  ) {
    super();
  }

  async run(passedParams: string[]) {
    const queryCondition = passedParams[0];
    let caldate;
    console.log('查询数据');
    // 正则表达式用于验证日期格式为 "yyyy-MM-dd"
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(queryCondition)) {
      console.log('日期格式错误，请使用 "yyyy-MM-dd" 格式。');
      return;
    }
    if (queryCondition) {
      console.log('计算时间:', queryCondition);

      caldate = queryCondition;
    } else {
      // 计算3天前的日期
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3);
      caldate = sevenDaysAgo.toISOString().split('T')[0];
      console.log('未提供按照三天前计算', caldate);
    }
    const queryResult = await this.reportService.executeQuery(caldate);

    if (queryResult) {
      console.log('查询结果:');
      console.log(queryResult);
    } else {
      console.log('未找到匹配的数据.');
    }
  }
}
