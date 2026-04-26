import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SupportModule } from '../support/support.module';

@Module({
  imports: [SupportModule],
  providers: [TelegramService],
})
export class TelegramModule {}
