import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthService } from './service/auth.service';
import { JWTController } from './controller/JWTController';
import { LocalController } from './controller/LocalController';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserDao } from './respository/UserDao';
import { PostgreSqlConnector } from './respository/postgresql.dbconnector';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'mysecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [JWTController,LocalController,UserController],
  providers: [LocalStrategy,JwtStrategy, PostgreSqlConnector, AuthService,UserDao],
  exports: [AuthService,UserDao],
})
export class AuthModule {}
