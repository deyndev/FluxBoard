import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
}

