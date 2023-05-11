import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PostgreSqlConnector } from 'src/respository/postgresql.dbconnector';
import { TableDao } from 'src/respository/TableDao';
import { TableService } from 'src/service/table.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
@Controller("table")
export class TableController {
  private logger: Logger = new Logger('TableController');
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
   
     const table = await this.tableDao.findTable(+params.id);
     if(table)
       return JSON.stringify({ok:true,message:table});
     else
      return JSON.stringify({ok:false})
  }
  @Get("sitdown/:id")
  @UseGuards(JwtAuthGuard)
  async sitdown(@Req() req, @Param() params: any,@Query('seatNo') seatNo: number):Promise<string>{
     this.logger.log(req.user)
     this.tableService.sitDown(params.id,req.user.uid,+seatNo).then(()=>console.log("sit down completed"))
    return ""
  }
  @Get("leave/:tableId")
  @UseGuards(JwtAuthGuard)
  async leave(@Req() req,@Param() params: any):Promise<string>{
     this.tableService.leave(req.user.uid,+params.tableId).then(()=>console.log("leave table"))
    return ""
  }
  @Get("standup/:tableId")
  @UseGuards(JwtAuthGuard)
  async standup(@Req() req,@Param() params: any):Promise<string>{
     this.tableService.standup(req.user.uid,+params.tableId).then(()=>console.log("standup completed"))
    return null
  }
}
