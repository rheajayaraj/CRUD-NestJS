import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);
      request['user'] = decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = request['user'] as { userId: string; type: string };

    if (user.type === 'patient') {
      throw new ForbiddenException('Patient cannot view doctor details');
    }

    return true;
  }
}
