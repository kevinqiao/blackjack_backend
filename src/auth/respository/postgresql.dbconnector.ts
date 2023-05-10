import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PostgreSqlConnector {
  pool:Pool
  constructor(){
      this.init();
  }
  init=()=>{
   

    this.pool = new Pool({
      user: 'kqiao',
      host: 'localhost',
      database: 'blackjack',
      password: 'test',
      port: 5432,
    });
    
  }
  getConnection(): Pool {
     return this.pool
  }
}
