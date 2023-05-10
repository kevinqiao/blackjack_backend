import { Controller, Get, Param, Query } from '@nestjs/common';
import { SocketGateway } from 'src/gateway/socket.gateway';
import { EventService } from 'src/service/event.service';
import { AppService } from '../service/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private readonly eventService:EventService) {
    
  }

  @Get()
  getHello(): string {
    if(this.eventService){
        this.eventService.sendEvent({name:"testing",topic:"model",delay:0})
    }
    return this.appService.getHello();
  }
  @Get("sit")
  async sit(@Query('uid') uid: string,@Query('tableId') tableId: number,@Query('seatNo') seatNo: number):Promise<string>{
    this.eventService.sendEvent({ name: "sitDown", topic: "model", selector:{uid,tableId},data:{uid,tableId,seatNo},delay: 0 });
    return "successfully sit down"
  }
  @Get("join")
  async join(@Query('uid') uid: string,@Query('tableId') tableId: number):Promise<string>{
    this.eventService.sendEvent({ name: "joinTable", topic: "model", selector:{uid,tableId}, delay: 0 });
    return "successfully join table"
  }
  @Get("send")
  async send(@Query('txt') txt: string,@Query('tableId') tableId: number):Promise<string>{
    this.eventService.sendEvent({ name: "message", topic: "model", selector:{tableId},data:{txt}, delay: 0 });
    return "successfully send message"
  }
}
