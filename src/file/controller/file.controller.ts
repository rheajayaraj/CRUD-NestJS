import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fileType from 'file-type';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('file')
@ApiTags('Files')
export class UploadController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiOperation({ summary: 'File validation' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Any file',
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    const detected = await fileType.fromBuffer(file.buffer);

    if (!detected) {
      throw new BadRequestException('Unsupported or corrupted file');
    }

    const uploadedExt = path
      .extname(file.originalname)
      .toLowerCase()
      .replace('.', '');

    if (detected.ext !== uploadedExt) {
      throw new BadRequestException(
        `File extension mismatch: content is '${detected.ext}', but uploaded as '.${uploadedExt}'`,
      );
    }

    return {
      message: 'File validated successfully',
      mimeType: detected.mime,
    };
  }
}
