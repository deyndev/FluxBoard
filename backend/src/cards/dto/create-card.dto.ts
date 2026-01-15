import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsNotEmpty()
  @IsUUID()
  columnId: string;
}

