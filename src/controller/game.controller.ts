import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GameDao } from 'src/respository/GameDao';
import { EventService } from 'src/service/event.service';
import { GameService } from 'src/service/game.service';

@Controller("game")
export class GameController {
  private logger: Logger = new Logger('GameController');
  constructor(private readonly gameService: GameService,private readonly gameDao:GameDao) {
    
  }

  @Get("find/:gameId")
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req, @Param() params: any):Promise<string>{
     const game = await  this.gameDao.findGame(params.gameId)
    return JSON.stringify(game)
  }
  @Get("deal/:gameId")
  @UseGuards(JwtAuthGuard)
  async deal(@Req() req, @Param() params: any,@Query('chips') chips: number):Promise<string>{
     this.logger.log(req.user)
     if(chips)
        await this.gameService.deal(params.gameId,req.user.uid,chips);
    return ""
  }
  @Get("hit/:gameId")
  @UseGuards(JwtAuthGuard)
  async hit(@Req() req, @Param() params: any):Promise<string>{
     this.logger.log(req.user)
     if(params.gameId){
         this.logger.log("hit card....")
        await this.gameService.hit(params.gameId,req.user.uid);
     }
    return ""
  }
  @Get("split/:gameId")
  @UseGuards(JwtAuthGuard)
  async split(@Req() req, @Param() params: any):Promise<string>{
     this.logger.log(req.user)
     if(params.gameId){
         this.logger.log("split card....")
        await this.gameService.split(params.gameId,req.user.uid);
     }
    return ""
  }
  @Get("stand/:gameId")
  @UseGuards(JwtAuthGuard)
  async stand(@Req() req, @Param() params: any):Promise<string>{
     this.logger.log(req.user)
     if(params.gameId){
         this.logger.log("stand....")
        await this.gameService.stand(params.gameId,req.user.uid);
     }
    return ""
  }
}
