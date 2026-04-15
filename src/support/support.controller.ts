import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';
import { HandleMessageDto } from './dto/handle-message.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('message')
  async handleMessage(@Body() dto: HandleMessageDto) {
    const result = await this.supportService.handleMessage(
      dto.message,
      dto.threadId,
    );
    const lastMessage = result.messages.at(-1);
    return { response: lastMessage?.content };
  }
}
