import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "mysecret",
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUserById(payload.sub);
    console.log(user)
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
