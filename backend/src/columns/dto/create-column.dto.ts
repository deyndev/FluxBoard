import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsUUID()
  boardId: string;
}
