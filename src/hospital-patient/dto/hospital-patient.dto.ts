import { IsString } from 'class-validator';

export class identifierDTO {
  @IsString()
  identifier: string;
}
