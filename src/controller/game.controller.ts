import { Controller, Get } from '@nestjs/common';
import { SocketGateway } from 'src/gateway/socket.gateway';
import { EventService } from 'src/service/event.service';
import { GameService } from 'src/service/game.service';
import { AppService } from '../service/app.service';

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {
    
  }

  @Get()
  getHello(): string {
    return ""
  }
}
