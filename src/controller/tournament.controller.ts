import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TournamentModel } from 'src/model';
import { TournamentDao } from 'src/respository/TournamentDao';
import { TournamentService } from 'src/service/tournament.service';
import { PostgreSqlConnector } from 'src/respository/postgresql.dbconnector';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
@Controller("tournament")
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService,private readonly tournamentDao:TournamentDao,private readonly postsqlConnector:PostgreSqlConnector) {
    //  tournamentDao.initTournaments();
  }
  @Get('auth')
  login(@Req() req:any) {
    console.log(req.user)
    console.log("jwt controller")
    return 'This is a jwt guard response frmo tuornament';
  }
  @Get("list")
  async listAll():Promise<string>{
    const all= await  this.tournamentDao.findAll();
    return JSON.stringify(all);
  }
  @Get(":id")
  async findOne(@Param() params: any):Promise<string>{
    const tournament= await  this.tournamentDao.findTournament(+params.id);
    return JSON.stringify(tournament);
  }

  @Get("join/:id")
  async join(@Param() params: any,@Query('uid') uid: string,):Promise<string>{
   
    if(params.id){
      const table= await this.tournamentService.join(uid,+params.id);
      if(table)
        return JSON.stringify(table) ;
    }
    return null
  }
  @Get("init")
  getAll():string {
    const tournaments:TournamentModel[]=this.tournamentService.initTournaments();
    for(let tour of tournaments){
      console.log(tour)
      this.tournamentDao.createTournament(tour)
    }
    return "hello"
  };
  insertData=async ()=> {
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      // await client.query('BEGIN');
      await client.query("INSERT INTO weather VALUES ('San Francisco', 46, 50, 0.25, '1994-11-27')");
      // await client.query('COMMIT');
      console.log('Data inserted successfully!');
    } catch (err) {
      // await client.query('ROLLBACK');
      console.error(err);
    } finally {
      client.release();
    }
  }
}
