import { Module } from '@nestjs/common';
import { UploadController } from '../controller/file.controller';

@Module({
  controllers: [UploadController],
})
export class FileModule {}
