import { Controller, Delete, Get, HttpCode, Inject } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  @HttpCode(200)
  getHello(): string {
    return this.appService.getHello();
  }

  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    await this.appService.deleteAll();
  }
}
