import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { LocalAuthGuard } from '../guard/local.guard';
import { AuthService } from '../service/auth.service';

@Controller("local")
export class LocalController {
  constructor(private readonly authService:AuthService){

  }
  @Post('auth')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req:any) {
    const user = req.user;
    const token = await this.authService.getAccessToken(req.user);
    return {...user,token};  
  }
}
