import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class UserAgentParser {
  private readonly parser: typeof UAParser;

  constructor() {
    this.parser = UAParser;
  }

  parse(uaString: string) {
    try {
      const parser = new UAParser(uaString);
      const result = parser.getResult();

      return {
        os: result.os?.name || 'Unknown',
        browser: result.browser?.name || 'Unknown',
        device: result.device?.type || 'Desktop',
      };
    } catch (error) {
      return {
        os: 'Unknown',
        browser: 'Unknown',
        device: 'Desktop',
      };
    }
  }
}
