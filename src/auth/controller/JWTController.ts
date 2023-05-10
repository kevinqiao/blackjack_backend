import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt.guard';

@Controller("jwt")
export class JWTController {
  @Get('auth')
  @UseGuards(JwtAuthGuard)
  login(@Req() req:any) {
    console.log(req.user)
    console.log("jwt controller")
    return 'This is a jwt guard response';
  }
}
