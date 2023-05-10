import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../service/auth.service';
import { GOOGLE_CONFIG } from './auth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: GOOGLE_CONFIG.clientID,
      clientSecret: GOOGLE_CONFIG.clientSecret,
      callbackURL: GOOGLE_CONFIG.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateOAuth2User('google', profile.id, profile.emails[0].value);
    done(null, user);
  }
}
