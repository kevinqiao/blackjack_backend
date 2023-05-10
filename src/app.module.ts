import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GatewayModule } from './gateway/gateways.module';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { EventService } from './service/event.service';
import { GameService } from './service/game.service';
import { TurnService } from './service/actTurn.service';
import { TournamentService } from './service/tournament.service';
import { UserService } from './service/user.service';
import { GameDao } from './respository/GameDao';
import { TableDao } from './respository/TableDao';
import { TournamentDao } from './respository/TournamentDao';
import { TurnDao } from './respository/TurnDao';
import { DealProcessor } from './processor/DealProcessor';
import { HitProcessor } from './processor/HitProcessor';
import { InitGameProcessor } from './processor/InitGameProcessor';
import { LaunchProcessor } from './processor/LaunchProcessor';
import { InsureProcessor } from './processor/InsureProcessor';
import { NotActProcessor } from './processor/NotActProcessor';
import { SettleGameProcessor } from './processor/SettleGameProcessor';
import { SettleTournamentProcessor } from './processor/SettleTournamentProcessor';
import { SplitProcessor } from './processor/SplitProcessor';
import { StandProcessor } from './processor/StandProcessor';
import { GameEngine } from './service/gameEngine.service';
import { TournamentController } from './controller/tournament.controller';
import { PostgreSqlConnector } from './respository/postgresql.dbconnector';
import { TableController } from './controller/table.controller';
import { TableService } from './service/table.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/service/auth.service';



@Module({
  imports: [AuthModule,ScheduleModule.forRoot(), ConfigModule.forRoot(),GatewayModule],
  controllers: [AppController,TournamentController,TableController],
  providers: [
    AppService,
    EventService,
    GameService,
    GameEngine,
    TurnService,
    TournamentService,
    TableService,
    UserService,
    GameDao,
    TableDao,
    TournamentDao,
    TurnDao,
    DealProcessor,
    HitProcessor,
    InitGameProcessor,
    LaunchProcessor,
    InsureProcessor,
    NotActProcessor,
    SettleGameProcessor,
    SettleTournamentProcessor,
    SplitProcessor,
    StandProcessor,
    PostgreSqlConnector
  ],
})
export class AppModule {}
