import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('message')
  async handleMessage(@Body('message') message: string) {
    const result = await this.supportService.handleMessage(message);
    const lastMessage = result.messages.at(-1);
    return { response: lastMessage?.content };
  }
}
