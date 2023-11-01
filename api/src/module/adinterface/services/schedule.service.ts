import { Injectable } from '@nestjs/common';
import { ApiAdTask } from '../task/apiad.task';

@Injectable()
export class ScheduleService {
  constructor(private readonly ApiAdTask: ApiAdTask) {}

  executeTask() {
    this.ApiAdTask.ApiHandleCron();
    this.ApiAdTask.PlacementHandleCron();
  }
}
