;
import { GameModel, SeatModel, TableModel, TableSeat, TournamentModel } from "../model";
import { Logger } from '@nestjs/common';
import {GameDao} from "../respository/GameDao"
import {TableDao} from "../respository/TableDao";
import { TurnService } from "./actTurn.service";
import { TournamentDao } from "src/respository/TournamentDao";
import { SettleTournamentProcessor } from "src/processor/SettleTournamentProcessor";
import { DealProcessor } from "src/processor/DealProcessor";
import {HitProcessor} from "src/processor/HitProcessor";
import { StandProcessor } from "src/processor/StandProcessor";
import { SplitProcessor } from "src/processor/SplitProcessor";
import { LaunchProcessor } from "src/processor/LaunchProcessor";
import { InitGameProcessor } from "src/processor/InitGameProcessor";
import { InsureProcessor } from "src/processor/InsureProcessor";
import { SettleGameProcessor } from "src/processor/SettleGameProcessor";
import { NotActProcessor } from "src/processor/NotActProcessor";
import { Injectable } from "@nestjs/common";
import { TurnDao } from "src/respository/TurnDao";

@Injectable()
export class GameService {
    private logger: Logger = new Logger('GameService');
    private interval: NodeJS.Timeout;
    constructor(
        private readonly turnService:TurnService,
        private readonly turnDao:TurnDao,
        private readonly gameDao:GameDao,
        private readonly tableDao:TableDao,
        private readonly tournamentDao:TournamentDao,

        private readonly settleTournamentProcessor:SettleTournamentProcessor,
        private readonly dealProcessor:DealProcessor,
        private readonly hitProcessor:HitProcessor,
        private readonly standProcessor :StandProcessor,
        private readonly splitProcessor :SplitProcessor,
        private readonly launchProcessor:LaunchProcessor,
        private readonly initGameProcessor:InitGameProcessor,
        private readonly insureProcessor:InsureProcessor,

        private readonly settleProcessor:SettleGameProcessor,
        private readonly  notActProcessor:NotActProcessor,

        ) {
        this.startTask();
    }


    startTask(): void {
     if(!this.interval)
            this.interval = setInterval(async () => {
                try{
                await this.autoAct();
                }catch(err){
                    this.logger.log(err)
                }
                // console.log('Task executed in Game Service');
            }, 5000); // Execute the task every 1 second
    }
  
    stopTask(): void {
     if(this.interval)
       clearInterval(this.interval);
    }

     autoAct= async ()=>{    
        if(this.turnService){
           this.turnDao.findAllDue().then((turns)=>{
                this.logger.log(turns)

                for(let turn of turns){
                        this.gameDao.findGame(turn.gameId).then((game)=>{
                                if(game){
                                    this.notActProcessor.process(game)  
                                    if(turn.round===0){
                                        const seats = game.seats.filter((s)=>s.bet>0);
                                        if(seats?.length>0){
                                            this.launchProcessor.process(game)
                                            this.gameDao.update(game).then(()=>{})
                                        }else{
                                            this.turnService.stopCount(game.gameId)
                                            this.settle(game)
                                        }
                                    }else if(turn.round===1){
                                        const seat = game.seats.find((s)=>s.no===game.currentTurn.seat);
                                        if(seat){
                                            this.stand(game.gameId,seat.uid);
                                        }
                                        // const remainTime = turn.expireTime-Date.now();
                                        // if(remainTime<0&&turn.seat===game.currentTurn.seat){                                        
                                        //     this.standProcessor.process(game);
                                        //     if (game.status === 1) {
                                        //         console.log("game over")
                                        //         // turnService.stopCount(game.gameId)
                                        //         setTimeout(() => this.settle(game), 4000)
                                        //     } 
                                        // } 
                                    }
                                  
                                }
                        })
                }
            })
        }
    }
    getInitGame = (table: TableModel): GameModel => {
        table.lastStartSeat = table.lastStartSeat < 0 ? 0 : table.lastStartSeat + 1;
        for (let i = 0; i < 3; i++) {
            table.lastStartSeat = table.lastStartSeat + i > 2 ? 0 : table.lastStartSeat + i;
            const seat = table.seats.find((s: TableSeat) => s.no === table.lastStartSeat);
            if (seat)
                break;
        }
        const gameId = Date.now();
        const initData: GameModel = {
            gameId: gameId,
            ver: 0,
            tournamentId: 0,
            tableId: 0,
            startSeat: table.lastStartSeat,
            round: -1,
            cards: [],
            seats: [],
            currentTurn: { id: 0, gameId:gameId,round: -1, tableId:table.id, seat: -1, expireTime: 0, data: null },
            status: 0,
        };
        let currentSlotId = Date.now();
        for (let tableSeat of table.seats) {
            if (tableSeat.uid) {
                const seat: SeatModel = {
                    no: tableSeat.no,
                    uid: tableSeat.uid,
                    status: 0,
                    bet: 0,
                    insurance: 0,
                    currentSlot: currentSlotId++,
                    slots: []
                }
                const slot = { id: seat.currentSlot, cards: [], status: 0, score: 0 };
                seat.slots.push(slot)
                initData.seats.push(seat)
            }
        }
        currentSlotId++;
        const dealer: SeatModel = { no: 3, uid: null, status: 0, bet: 0, insurance: 0, currentSlot: currentSlotId, slots: [{ id: currentSlotId, cards: [], status: 0, score: 0 }] }
        initData.seats.push(dealer)
        return initData;

    }
    
     createGame = async (table: TableModel,delay:number): Promise<GameModel> => {
        
        const gameData: GameModel = this.getInitGame(table);
        gameData.tournamentId = table.tournamentId;
        gameData.tableId = table.id;
        this.initGameProcessor.process(gameData,delay)
        await this.gameDao.create(gameData);
        return gameData
    }

    deal = async (gameId: number, uid: string, chips: number) => {
       
        const gameObj: GameModel | null = await this.gameDao.findGame(gameId);
       
        if (gameObj) {

             const seat =gameObj.seats.find((s)=>s.uid===uid);
            if(seat){
                this.dealProcessor.process(gameObj,seat.no,chips);        
                const allBet = gameObj.seats.filter((s)=>s.no<3&&!s.bet);
                // this.logger.log(allBet)
                if(allBet?.length===0){                 
                        this.launchProcessor.process(gameObj)
                        this.logger.log(gameObj.currentTurn)
                        if (gameObj.status === 1) {
                            console.log("game over")
                            setTimeout(() => this.settle(gameObj), 4000)
                        }
                }
                await this.gameDao.update(gameObj);
            }
        }

    }

     hit = async (gameId: number,uid:string) => {
        const gameObj: GameModel | null = await this.gameDao.findGame(gameId);

        const seat =gameObj.seats.find((s)=>s.uid===uid);
        // this.logger.log(seat)
        if(seat){
            this.hitProcessor.process(gameObj);

            if (gameObj.status === 1) {
                console.log("game over")
                setTimeout(() => this.settle(gameObj), 4000)
            }
            await this.gameDao.update(gameObj);
        }

    }
   split = async (gameId: number,uid:string) => {
        const gameObj: GameModel | null = await this.gameDao.findGame(gameId);
        const seat =gameObj.seats.find((s)=>s.uid===uid);
        if(seat){
            this.splitProcessor.process(gameObj);
            await this.gameDao.update(gameObj);
        }
    }

   double = () => {
      

    }
    insure = () => {

    }

    stand =async  (gameId: number,uid:string) => {
        const gameObj: GameModel | null = await this.gameDao.findGame(gameId);
        const seat =gameObj.seats.find((s)=>s.uid===uid);
        this.logger.log(seat)
        if(seat){
            this.standProcessor.process(gameObj);

            if (gameObj.status === 1) {
                console.log("game over")
                setTimeout(() => this.settle(gameObj), 4000)
            }
            await this.gameDao.update(gameObj);
        }
    }

    settle = async (gameObj: GameModel) => {
        this.settleProcessor.process(gameObj);
        const table = await this.tableDao.findTable(gameObj.tableId);
        if (table) {
                    const tournament = await this.tournamentDao.findTournament(table.tournamentId)
          
                    if (tournament) {
                        if ((tournament.type === 0 && table.seats.filter((s) => s.no < 3).length > 0) || (tournament.type === 1 && table.games.length < tournament.rounds)) {
                            const newGame: GameModel = await  this.createGame(table,2000);
                            if (tournament.type === 0)
                                table.games = [newGame.gameId]
                            else
                                table.games.push(newGame.gameId)
                            await this.tableDao.updateTable(table);
                        } else{
                            this.settleTournamentProcessor.process(tournament, table)
                            //create  event "tournament over"
                        }
                    }
        
        }
    }
 
}

