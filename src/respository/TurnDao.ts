import { Injectable } from "@nestjs/common";
import { ActionTurn } from "../model";
import { Logger } from '@nestjs/common';
import { PostgreSqlConnector } from "./postgresql.dbconnector";
@Injectable()
export class TurnDao {
  private logger: Logger = new Logger('TurnDao');
  constructor(private readonly postsqlConnector:PostgreSqlConnector){}
  update =async (data: any) => {
  
   const pool = this.postsqlConnector.getConnection();
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     // Lock the row for update

     const lockQuery = 'SELECT * FROM act_turn WHERE gameid = $1 FOR UPDATE';
     await client.query(lockQuery, [data.gameId]);
 
     // Update the row with new JSON data
     const updateQuery = 'UPDATE act_turn SET data = $1,expireTime=$2 WHERE gameid = $3';
     await client.query(updateQuery, [data, data.expireTime,data.gameId]);
 
     // Commit the transaction
     await client.query('COMMIT');
  
   } catch (error) {
     await client.query('ROLLBACK');
     console.error('Error updating JSON data:', error);
   } finally {
      client.release();
   }
     
 }
 create = async(turn: ActionTurn) => {
    
   const pool = this.postsqlConnector.getConnection();
   const client = await pool.connect();
   try {
     
   
     await client.query(`
       CREATE TABLE IF NOT EXISTS act_turn (
         gameid bigint PRIMARY KEY,
         expiretime bigint,
         data JSONB
       );
     `);
     await client.query(
       'INSERT INTO  act_turn (gameid,expiretime,data) VALUES ($1,$2,$3)',
       [turn.gameId,turn.expireTime,JSON.stringify(turn)]
     );
 
    
   } catch (err) {
     console.error('Error:', err);
   } finally {
     client.release(); // Close the database connection
   }
    
 }
 
 find = async (gameId: number): Promise<ActionTurn| null> => {
 
     const pool = this.postsqlConnector.getConnection();
     const client = await pool.connect();
     try {
       const result = await client.query('SELECT * FROM act_turn where gameId=$1',[gameId]); 
       if(result.rows.length>0)
         return  result.rows[0].data
     } catch (err) {
       console.error('Error:', err);
     } finally {
       client.release(); // Close the database connection
     }
    
     return null;
   }

 findAllDue = async (): Promise<ActionTurn[]> => {
  const turns:ActionTurn[]=[];
  const pool = this.postsqlConnector.getConnection();
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM act_turn where expireTime<$1',[Date.now()]); 
    const rows = result.rows.reduce((acc, row) => {
      acc.push(row.data);
      return acc;
    }, []);
    if(rows.length>0)
    turns.push(...rows)
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release(); // Close the database connection
  }
  return turns;
}
   remove = async (gameId: number): Promise<void> => {
 
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
       await client.query('delete FROM act_turn where gameId=$1',[gameId]);      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
  }
 
 

}
