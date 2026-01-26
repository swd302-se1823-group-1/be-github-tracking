import { ApiProperty } from '@nestjs/swagger';

export interface CursorPageMetaDtoParameters {
  total: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export class CursorPageMetaDto {
  @ApiProperty()
  readonly total: number;

  @ApiProperty({ nullable: true })
  readonly nextCursor: string | null;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ total, nextCursor, hasNextPage }: CursorPageMetaDtoParameters) {
    this.total = total;
    this.nextCursor = nextCursor;
    this.hasNextPage = hasNextPage;
  }
}
