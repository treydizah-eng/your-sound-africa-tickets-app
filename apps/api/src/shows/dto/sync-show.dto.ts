import { IsInt, IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncTicketTypeDto {
  @IsInt()
  ysamsPoolId: number;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsInt()
  totalQty: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class SyncShowDto {
  @IsInt()
  ysamsId: number;

  @IsString()
  title: string;

  @IsString()
  venue: string;

  @IsString()
  city: string;

  @IsDateString()
  showDate: string;

  @IsOptional()
  @IsString()
  doorsTime?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTicketTypeDto)
  ticketTypes: SyncTicketTypeDto[];
}
