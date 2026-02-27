// Import decorators for Swagger documentation
import { ApiProperty } from '@nestjs/swagger';

// Nested DTOs to match the interface structure
class CategoryStatsDto {
  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({ example: 1024000 })
  sizeBytes: number;
}

class ItemsStatsDto {
  @ApiProperty({ example: 25 })
  count: number;

  @ApiProperty({ example: 5242880 })
  totalSizeBytes: number;

  @ApiProperty()
  byCategory: {
    images: CategoryStatsDto;
    videos: CategoryStatsDto;
    audio: CategoryStatsDto;
    documents: CategoryStatsDto;
    other: CategoryStatsDto;
  };
}

class CapsuleTypeStatsDto {
  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ example: 5 })
  openable: number;

  @ApiProperty({ example: 2 })
  opened: number;

  @ApiProperty()
  items: ItemsStatsDto;
}

class CapsulesStatsDto {
  @ApiProperty({ example: 15 })
  count: number;

  @ApiProperty()
  public: CapsuleTypeStatsDto;

  @ApiProperty()
  private: CapsuleTypeStatsDto;
}

class RecipientsStatsDto {
  @ApiProperty({ example: 8 })
  unique: number;

  @ApiProperty({ example: 12 })
  total: number;

  @ApiProperty({ example: 5 })
  opened: number;
}

class LibraryStatsDto {
  @ApiProperty({ example: 30 })
  items: number;

  @ApiProperty({ example: 10485760 })
  sizeBytes: number;

  @ApiProperty({ example: 5 })
  unused: number;

  @ApiProperty()
  byCategory: {
    images: CategoryStatsDto;
    videos: CategoryStatsDto;
    audio: CategoryStatsDto;
    documents: CategoryStatsDto;
    other: CategoryStatsDto;
  };
}

class TotalsDto {
  @ApiProperty({ example: 100 })
  users: number;

  @ApiProperty()
  capsules: CapsulesStatsDto;

  @ApiProperty()
  recipients: RecipientsStatsDto;

  @ApiProperty()
  library: LibraryStatsDto;
}

export class DetailedStatsDto {
  @ApiProperty()
  totals: TotalsDto;
}