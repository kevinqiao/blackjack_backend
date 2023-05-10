import { Controller, Get } from '@nestjs/common';
import { EventService } from 'src/service/event.service';
import { UserService } from 'src/service/user.service';

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {
    
  }

  @Get("login")
  login(): string {
   return ""
  }
}
