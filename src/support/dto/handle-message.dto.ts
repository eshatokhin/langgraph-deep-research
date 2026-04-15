import { IsString, IsNotEmpty } from 'class-validator';

export class HandleMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  threadId!: string;
}
