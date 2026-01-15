import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
  @IsOptional()
  @IsString()
  rank?: string;
}
