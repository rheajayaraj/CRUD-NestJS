import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PatientGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    const isBlocked = await this.cacheManager.get(`blocked:${token}`);
    if (isBlocked) {
      throw new UnauthorizedException('This token has been blocklisted');
    }

    try {
      const decoded = this.jwtService.verify(token);
      request['user'] = decoded;
      if (decoded.type === 'doctor') {
        const expiresIn = decoded.exp * 1000 - Date.now();
        await this.cacheManager.set(`blocked:${token}`, true, expiresIn);
        throw new ForbiddenException('Patient cannot view doctor details');
      }
      return true;
    } catch (err) {
      try {
        const decoded = this.jwtService.decode(token) as any;
        const expiresIn = decoded?.exp ? decoded.exp * 1000 - Date.now() : 0;
        await this.cacheManager.set(
          `blocked:${token}`,
          true,
          expiresIn || 60 * 60 * 1000,
        );
      } catch (_) {}

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
