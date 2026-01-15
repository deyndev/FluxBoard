import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  columnId: string;
}
