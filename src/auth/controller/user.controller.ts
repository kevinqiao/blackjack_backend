import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { LocalAuthGuard } from '../guard/local.guard';
import { UserModel } from '../respository/user.model';
import { UserDao } from '../respository/UserDao';
import { AuthService } from '../service/auth.service';
import { Logger } from '@nestjs/common';
import { CustomEvent } from 'src/event/custom.event';

@Controller("auth")
export class UserController {
  private logger: Logger = new Logger('AuthController');
  constructor(private readonly userDao:UserDao,private readonly authService:AuthService,private readonly eventBus: EventBus){

  }
  @Get('load')
  async load(@Req() req:any) {
   
    for(let i=0;i<3;i++){
      const hashedPwd = await this.authService.hashPassword("12345");
      const user:UserModel= {
        uid:(Date.now()+i)+"",
        channelUID:"kevin"+(i+1),
        password:hashedPwd
      }
      await this.userDao.createUser(user);
    }
    return "users loaded"
  }
  @Get('list')
  async list(@Req() req:any) {
     return await this.userDao.findAll();
  }
  @Get('remove')
  async remove(@Req() req:any) {
     await this.userDao.removeAll()
     return "all deleted"
  }
  @Get('signin')
  async signin(@Query('name') name: string,@Query('password') password: string) {
      const user = await this.authService.validateUser(name,password);
      const token = await this.authService.getAccessToken(user.uid);
      if(user){
        return JSON.stringify({...user,token})
      }
      return "password wrong"
  }
  @Post('password')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req:any) {
    const user = req.user;
    const token = await this.authService.getAccessToken(req.user);
    this.eventBus.publish(new CustomEvent("loginSuccess",user));
    return {...user,token};  
  }
  @Get('token')
  @UseGuards(JwtAuthGuard)
  async signinByToken(@Req() req:any) {
    this.logger.log(req.user)
    const token = await this.authService.getAccessToken(req.user)
    const user = await this.userDao.find(req.user.uid);
    this.eventBus.publish(new CustomEvent("loginSuccess",user));
    if(user){
       delete user['password']
       return {...user,token}
    }
    return 'This is a jwt guard response';
  }
}
