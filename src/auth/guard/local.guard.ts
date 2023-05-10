import { ExecutionContext, Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    handleRequest(err:any, user:any, info:any, context:ExecutionContext, status?:any) {
        if (err || !user) {
          this.throwError(err, info, status, context.switchToHttp().getResponse());
        }
        return user;
      }
    
      throwError(err, info, status, @Res() res: Response) {
        // Redirect the user to the login page
        res.redirect('/login');
      }
}
