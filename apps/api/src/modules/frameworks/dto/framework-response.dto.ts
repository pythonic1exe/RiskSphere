import { ApiProperty } from '@nestjs/swagger';

class FrameworkSelectionDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  frameworkCatalogId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  selectedAt!: Date;
}

class FrameworkCatalogItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  version!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  status!: string;
}

export class FrameworkCatalogResponseDto {
  @ApiProperty({ type: [FrameworkCatalogItemDto] })
  frameworks!: FrameworkCatalogItemDto[];
}

export class FrameworkSelectionResponseDto {
  @ApiProperty({ type: FrameworkCatalogItemDto })
  framework!: FrameworkCatalogItemDto;

  @ApiProperty({ type: FrameworkSelectionDto })
  selection!: FrameworkSelectionDto;
}
