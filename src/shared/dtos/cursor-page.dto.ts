import { ApiProperty } from '@nestjs/swagger';
import { CursorPageMetaDto } from './cursor-page-meta.dto';

export class CursorPageDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly meta: CursorPageMetaDto;

  constructor(data: T[], meta: CursorPageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
