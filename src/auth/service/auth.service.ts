import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../respository/user.model';
import { UserDao } from '../respository/UserDao';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService,private readonly userDao:UserDao) {}
  // validate for jwt guard
  async validateUserById(uid:string){
    const user = { uid: 1, username: 'admin', password: '$2b$10$MBh1dRtjhA14tPZmBV7Hv.xCYmZlNSVZpsbGLIOr8aQntbwmYPk7m' };
    // if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
  }
  //validate for local username and password
  async validateUser(username: string, passwd: string): Promise<any> {
    const user:UserModel= await this.userDao.findByChannelUID(username);
    if(bcrypt.compare(passwd,user.password)){
    // const user = { uid: 1, username: 'admin', password: '$2b$10$MBh1dRtjhA14tPZmBV7Hv.xCYmZlNSVZpsbGLIOr8aQntbwmYPk7m' };
    // if (user && await bcrypt.compare(password, user.password)) {
      const { password,channelUID, ...result } = user;
      return result;
    }
    return null;
  }
  async validateOAuth2User(channel:string, channelUID:string, email:string): Promise<any> {
    return null;
  }

  async getAccessToken(user: any) {
    const payload = { sub: user.uid };
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
    return this.jwtService.sign(payload)
  }
  async hashPassword(password:string) {
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);
      return payload;
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
  
}
