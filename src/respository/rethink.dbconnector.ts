import { Injectable } from '@nestjs/common';
import * as r from 'rethinkdb';
import { Connection } from 'rethinkdb';

@Injectable()
export class RethinkConnector {
  private connection:Connection;
  constructor(){
      this.init();
  }
  init=()=>{
    r.connect({ host: 'localhost', port: 28015 })
    .then((conn: Connection) => {
      this.connection= conn;
      // Use the connection object to interact with the database
    })
    .catch((err: Error) => {
      console.log('Error connecting to RethinkDB:', err);
    });
  }
  getConnection(): Connection {
     if(!this.connection)
     this.init();
     return this.connection;
  }
}
