import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { corsConfig, validatePipeConfig } from './configs/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap')
  app.useGlobalPipes(new ValidationPipe(validatePipeConfig));
  app.enableCors(corsConfig)
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT') ?? 3000
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter)
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`)
}
bootstrap();
