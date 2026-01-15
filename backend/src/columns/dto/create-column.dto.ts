import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsUUID()
  boardId: string;
}

