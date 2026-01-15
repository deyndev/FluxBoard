import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptional()
  @IsString()
  rank?: string;

  @IsOptional()
  @IsUUID()
  columnId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}
