
import { Injectable } from "@nestjs/common";
import { UserDao } from "src/auth/respository/UserDao";
import { EventService } from "src/service/event.service";
import { TableModel, TournamentModel } from "../model";



@Injectable()
export class SettleTournamentProcessor{
    constructor(
        private readonly eventService:EventService,
        private readonly userDao:UserDao
    ){}
    process = async (tournament: TournamentModel,table:TableModel) => {
        console.log("tournament round over")
        this.eventService.sendEvent({ name: "finishTournament", topic: "model", data: {id:table.tournamentId}, delay: 10 })
        for(let seat of table.seats){
            if(seat.no<3){
                const user = await this.userDao.find(seat.uid);
                user.tableId=0;
                await this.userDao.updateUser(user);
            }
        }
   }


}

