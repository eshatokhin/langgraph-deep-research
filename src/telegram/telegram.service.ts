import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { SupportService } from '../support/support.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly supportService: SupportService,
  ) {
    this.bot = new Telegraf(
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
    );
  }

  async onModuleInit() {
    this.bot.on('text', async (ctx) => {
const userMessage = ctx.message.text;
      const threadId = String(ctx.chat.id);

      try {
        const result = await this.supportService.handleMessage(
          userMessage,
          threadId,
        );

        const lastMessage = result.messages.at(-1);
        const response = lastMessage?.content as string;

        if (response) {
          await ctx.reply(response);
        }
      } catch (error) {
        console.error('Error handling Telegram message:', error);
        await ctx.reply(
          'Виникла технічна помилка. Будь ласка, спробуйте ще раз.',
        );
      }
    });

    void this.bot.launch();
  }

  async onModuleDestroy() {
    this.bot.stop();
  }
}
