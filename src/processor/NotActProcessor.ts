
import { Injectable } from "@nestjs/common";
import { EventService } from "src/service/event.service";
import { SeatModel,GameModel} from "../model";
import {TableDao} from "../respository/TableDao";


@Injectable()
export class NotActProcessor{
    constructor(
        private readonly eventService:EventService,
        private readonly tableDao:TableDao
    ){}

     process = async (game:GameModel) => {
        const table = await this.tableDao.findTable(game.tableId);
        if(!table)
            return;
        if(game.currentTurn.round===0){
            const unactedSeats = game.seats.filter((s)=>s.no<3&&(!s.bet||s.bet===0));
            if(unactedSeats?.length>0){
                     for(let useat of unactedSeats){

                        const seat = table.seats.find((s) => s.no === useat.no);
                        if(seat){
                            console.log(JSON.parse(JSON.stringify(seat)))
                            if(seat.missActs===1){
                                 table.seats = table.seats.filter((s)=>s.no!==seat.no)
                                this.eventService.sendEvent({
                                    name: "removeSeat", topic: "model", data: { tableId:table.id,seatNo: seat.no }, delay: 10})  
                            }else
                            seat.missActs=seat.missActs?seat.missActs+1:1   
                        }
                     }  
                    await  this.tableDao.updateTable(table) 
               
            }
            if(table.seats.length===0)
                this.eventService.sendEvent({ name: "clearGame", topic: "model", data: {gameId:game.gameId}, delay: 100 });
            
        }else if(game.currentTurn.round===1){
            const seat = table.seats.find((s) => s.no === game.currentTurn.seat);
            if(seat){
                console.log(JSON.parse(JSON.stringify(seat)))
                if(seat.missActs===1){
                    table.seats = table.seats.filter((s)=>s.no!==seat.no)
                    this.eventService.sendEvent({
                        name: "removeSeat", topic: "model", data: { tableId:table.id,seatNo: seat.no }, delay: 10})  
                }else
                seat.missActs=seat.missActs?seat.missActs+1:1   
                await this.tableDao.updateTable(table) 
            }
         }  
       
    }

}



