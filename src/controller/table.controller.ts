import { Controller, Get, Param, Query } from '@nestjs/common';
import { TournamentModel } from 'src/model';
import { TournamentDao } from 'src/respository/TournamentDao';
import { TournamentService } from 'src/service/tournament.service';
import { PostgreSqlConnector } from 'src/respository/postgresql.dbconnector';
import { TableDao } from 'src/respository/TableDao';
import { TableService } from 'src/service/table.service';
@Controller("table")
export class TableController {
  constructor(private readonly tableService: TableService,private readonly tableDao:TableDao,private readonly postsqlConnector:PostgreSqlConnector) {
    //  tournamentDao.initTournaments();
  }

  // @Get(":id")
  // async findOne(@Param() params: any):Promise<string>{
  //   const table= await  this.tableDao.findTable(+params.id);
  //   if(table)
  //   return JSON.stringify(table);
  //   else
  //    return null
  // }
  @Get(":id")
  async findTable(@Param() params: any):Promise<string>{
    console.log("find table with id:"+params.id)
     const table = await this.tableDao.findTable(+params.id);
     if(table)
       return JSON.stringify({ok:true,message:table});
     else
      return JSON.stringify({ok:false})
  }
  @Get("sitdown/:id")
  async sitdown(@Param() params: any,@Query('uid') uid: string,@Query('seatNo') seatNo: number):Promise<string>{
     this.tableService.sitDown(params.id,uid,seatNo).then(()=>console.log("sit down completed"))
    return null
  }
  @Get("leave/:id")
  async leave(@Param() params: any,@Query('uid') uid: string):Promise<string>{
     this.tableService.leave(uid,+params.id).then(()=>console.log("leave completed"))
    return null
  }
  @Get("standup/:id")
  async standup(@Param() params: any,@Query('uid') uid: string,@Query('seatNo') seatNo: number):Promise<string>{
     this.tableService.standup(uid,+params.id,seatNo).then(()=>console.log("standup completed"))
    return null
  }
}
