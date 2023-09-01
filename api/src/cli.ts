import { ConsoleModule } from './module/console/console.module';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(ConsoleModule);
}

bootstrap()
  .then(() => console.log('Done'))
  .catch((err) => console.error(err));
