
import { Injectable, Logger } from "@nestjs/common";
import { EventService } from "src/service/event.service";
import { SeatModel,GameModel} from "../model";
import {TableDao} from "../respository/TableDao";


@Injectable()
export class NotActProcessor{
    private logger: Logger = new Logger('NotAct Processor');
    constructor(
        private readonly tableDao:TableDao,private readonly eventService:EventService
    ){}

     process = async (game:GameModel) => {
        const table = await this.tableDao.findTable(game.tableId);
        if(!table&&table.tournamentType>0)
            return;
        if(game.currentTurn.round===0){
            const unactedSeats = game.seats.filter((s)=>s.no<3&&(!s.bet||s.bet===0)).map((s)=>s.no);
            table.seats.forEach((s)=>{
                if(unactedSeats.includes(s.no)){
                   s.missActs=s.missActs?s.missActs+1:1
                   this.logger.log(s)
                }
            })
         
        }else{
          //  this.logger.log(game.currentTurn);
            if(game.currentTurn.seat!==3){
                const seat = table.seats.find((s)=>s.no===game.currentTurn.seat);
                if(seat){
                    seat.missActs=seat.missActs?seat.missActs+1:1
                } 
                this.logger.log(seat)       
            }
        }
        const toLeaveSeats = table.seats.filter((s)=>s.missActs&&s.missActs>1);

        if(toLeaveSeats){
            for(const seat of toLeaveSeats){
                this.eventService.sendEvent({ name: "standup", topic: "model",selector:{tableId:table.id}, data: {tableId:table.id,...seat}, delay: 0 })                 
            }
        }
        table.seats = table.seats.filter((s)=>!s.missActs||s.missActs<2)
        await  this.tableDao.updateTable(table)            
    }

}



