import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AsyncTryCatch } from './decorators/try-catch.decorator';

@AsyncTryCatch()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
