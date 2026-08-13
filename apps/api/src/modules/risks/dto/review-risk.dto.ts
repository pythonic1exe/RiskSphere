import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ReviewRiskDto {
  @ApiProperty({ format: 'date-time' }) @IsDateString() nextReviewAt!: string;
}
