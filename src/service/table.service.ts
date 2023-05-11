import { Injectable } from "@nestjs/common";
import { TableDao } from "src/respository/TableDao";
import { TournamentDao } from "src/respository/TournamentDao";
import { TableModel, TournamentModel } from "../model";
import { EventService } from "./event.service";
import { GameService } from "./game.service";
import { Logger } from '@nestjs/common';
import { UserDao } from "src/auth/respository/UserDao";

@Injectable()
export class TableService  {
    private logger: Logger = new Logger('TableService');
    constructor(
        private readonly gameService:GameService,
        private readonly userDao:UserDao,
        private readonly tableDao:TableDao,
        private readonly tournamentDao:TournamentDao,
        private readonly eventService:EventService
    ){

    }
    
   
    sitDown = async (tableId: number, uid: string, seatNo: number) => {
        this.logger.log("tableId:"+tableId+";uid:"+uid+";seat:"+seatNo)
        const table = await this.tableDao.findTable(tableId);
  
        if (table) {
            let seat = table.seats.find((s) => s.no === seatNo);
            if (!seat) {
                seat = { no: Number(seatNo), uid: uid, chips: 0, status: 0 };
                table.seats.push(seat)
            } else if (!seat.uid) {
                seat.uid = uid
            }
            if (!table.games)
                table.games = [];

            if (table.seats.length===1) {
                const game = await this.gameService.createGame(table,0);
                table.games = [game.gameId]
            }
            this.logger.log(table)
            await this.tableDao.updateTable(table);
            // await this.userDao.updateUser({ uid: uid, tableId: tableId })
             this.eventService.sendEvent({ name: "sitDown", topic: "model",selector:{uid,tableId}, data: {tableId:table.id,...seat}, delay: 50 })
        }

    }
    leave = async (uid: string, tableId: number) => {
        const table = await  this.tableDao.findTable(tableId);
        if (table) {
            const seat = table.seats.find((s)=>s.uid===uid);
            if(seat){
                const seats = table.seats.filter((s) => s.uid !== uid);
                table.seats = seats;
                await this.tableDao.updateTable(table)
                this.eventService.sendEvent({ name: "standup", topic: "model",selector:{uid,tableId}, data: {tableId,...seat}, delay: 0 })
            }

            await this.userDao.updateUser({ uid: uid, tableId: 0 })
            this.eventService.sendEvent({ name: "leaveTable", topic: "model",selector:{uid,tableId}, data: { tableId:+tableId,uid }, delay: 10 })

        }
    }
    standup = async (uid: string, tableId: number) => {
        const table = await this.tableDao.findTable(tableId);
        if (table) {
            const seat = table.seats.find((s)=>s.uid===uid);
            if(seat){
                const seats = table.seats.filter((s) => s.uid !== uid);
                table.seats = seats;
                await this.tableDao.updateTable(table)
                this.eventService.sendEvent({ name: "standup", topic: "model", selector:{uid,tableId},data: {tableId,...seat}, delay: 0 })
            }
        }
    }

}

