import { Injectable } from "@nestjs/common";
import { UserDao } from "src/auth/respository/UserDao";
import { TableDao } from "src/respository/TableDao";
import { TournamentDao } from "src/respository/TournamentDao";
import { TableModel, TournamentModel } from "../model";
import { EventService } from "./event.service";
import { GameService } from "./game.service";

@Injectable()
export class TournamentService  {
    constructor(
        private readonly userDao:UserDao,
        private readonly tableDao:TableDao,
        private readonly tournamentDao:TournamentDao,
        private readonly eventService:EventService
    ){

    }
    initTournaments = (): TournamentModel[] => {
        const tournaments: TournamentModel[] = [];
        for (let i = 0; i < 2; i++) {
          const tournament: TournamentModel = {
            id: Date.now() + i * 1000 + i,
            type: 0,//0-free 1-sigo 2-world 3-friend
            startingStack: 0,
            minPlayers: 1,
            rounds: 1,
            minBet: (i + 1) * 50,
            maxBet: (i + 1) * 150,
            status: 0,
          }
          tournaments.push(tournament);
        }
        for (let i = 0; i < 2; i++) {
          const tournament: TournamentModel = {
            id: Date.now() + i * 2000 + (i + 6),
            type: 1,//0-free 1-sigo 2-friend
            startingStack: 1200,
            minPlayers: 3,
            rounds: 4,
            minBet: (i + 1) * 50,
            maxBet: (i + 1) * 150,
            status: 0,
          }
          tournaments.push(tournament);
        }
        return tournaments;
    }
    join = async (uid:string,tournamentId:number):Promise<TableModel|null> => {
        let table = null;
        console.log("start joinging...")
        const tournament = await this.tournamentDao.findTournament(tournamentId);
        if (tournament?.type === 0) {
            let tables: TableModel[] | null = await this.tableDao.findTournamentTables(tournament.id);
            console.log(tables)
            if (!tables || tables.length === 0) {
                table = {
                    id: Date.now(),
                    tournamentId: tournament.id,
                    tournamentType: 0,
                    size: 3,
                    lastStartSeat: -1,
                    sits: 0,
                    seats: [],
                    games: [],
                    status: 0,
                    ver: 0
                }
                tables = [table]
                await this.tableDao.createTable(table);
            }
            tables = tables.filter((t) => t.sits < 3 && t.status === 0).sort((a, b) => a.sits - b.sits);
            
            if (tables.length > 0)
                table = tables[0]

        } else if (tournament?.type === 1) {
            table = {
                id: Date.now(),
                tournamentId: tournament.id,
                tournamentType: 0,
                size: 3,
                lastStartSeat: -1,
                sits: 0,
                seats: [],
                games: [],
                status: 0,
                ver: 0
            }
            await this.tableDao.createTable(table);
        }
        if(table){
            await this.userDao.updateUser({uid,tableId:table.id})
            this.eventService.sendEvent({ name: "joinTable", topic: "model",selector:{uid,tableId:table.id}, data: { tableId:table.id,uid }, delay: 50 })
        }
        return table

    }
  

}

