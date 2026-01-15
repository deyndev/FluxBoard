import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rank?: string;
}

