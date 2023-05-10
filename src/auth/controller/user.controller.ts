import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserModel } from '../respository/user.model';
import { UserDao } from '../respository/UserDao';
import { AuthService } from '../service/auth.service';


@Controller("user")
export class UserController {
  constructor(private readonly userDao:UserDao,private readonly authService:AuthService){

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
}
