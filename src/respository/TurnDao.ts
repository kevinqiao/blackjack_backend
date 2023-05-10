import { Injectable } from "@nestjs/common";
import { ActionTurn } from "../model";
import { LocalStorage } from "node-localstorage";
import { PostgreSqlConnector } from "./postgresql.dbconnector";
@Injectable()
export class TurnDao {
  constructor(private readonly postsqlConnector:PostgreSqlConnector){}
  update =async (data: any) => {
   const pool = this.postsqlConnector.getConnection();
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     // Lock the row for update
     const lockQuery = 'SELECT * FROM act_turn WHERE gameId = $1 FOR UPDATE';
     await client.query(lockQuery, [data.id]);
 
     // Update the row with new JSON data
     const updateQuery = 'UPDATE act_turn SET expireTime = $1 and data = $2 WHERE gameId = $3';
     await client.query(updateQuery, [data.expireTime, data, data.gameId]);
 
     // Commit the transaction
     await client.query('COMMIT');
     console.log('Updated act turn data for game:', data.gameId);
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
         gameId bigint PRIMARY KEY,
         expireTime bigint,
         data JSONB
       );
     `);
     await client.query(
       'INSERT INTO  act_turn (gameId,expireTime,data) VALUES ($1,$2,$3)',
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
