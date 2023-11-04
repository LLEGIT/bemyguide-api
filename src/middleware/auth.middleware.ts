import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserRole } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  use(req: Request, res: Response, next: () => void) {
    try {
      const token = req.cookies.bmg_jwt;
      if (!token) {
        return res.status(401).json({ errorMessage: 'Unauthorized' });
      }

      const verified = this.jwtService.verify(token);

      if (
        req.url.includes('administration') &&
        verified.role !== UserRole.ADMIN
      ) {
        return res.status(401).json({ errorMessage: 'Unauthorized' });
      }

      req.user = verified.userId;
      next();
    } catch (error) {
      return res.status(401).json({ errorMessage: 'Unauthorized', error });
    }
  }
}
