import { Injectable } from "@nestjs/common";
import { GameModel } from "../model/game/Game";
import { PostgreSqlConnector } from "./postgresql.dbconnector";
import { Logger } from '@nestjs/common';
@Injectable()
export class GameDao {
  private logger: Logger = new Logger('GameDao');
  constructor(private readonly postsqlConnector:PostgreSqlConnector){}
  update =async (data: any) => {
   const pool = this.postsqlConnector.getConnection();
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     // Lock the row for update
     const lockQuery = 'SELECT * FROM game WHERE id = $1 FOR UPDATE';
     await client.query(lockQuery, [data.gameId]);
 
     // Update the row with new JSON data
     const updateQuery = 'UPDATE game SET data = $1 WHERE id = $2';
     await client.query(updateQuery, [data, data.gameId]);
 
     // Commit the transaction
     await client.query('COMMIT');
     console.log('Updated game data for id:', data.gameId);
   } catch (error) {
     await client.query('ROLLBACK');
     console.error('Error updating JSON data:', error);
   } finally {
      client.release();
   }
     
 }

   create = async (game: GameModel) => {
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      
      // Create a table with a JSONB column
      await client.query(`
        CREATE TABLE IF NOT EXISTS game (
          id bigint PRIMARY KEY,
          data JSONB
        );
      `);
  
      // Insert JSON data into the JSONB column
      await client.query(
        'INSERT INTO  game (id,data) VALUES ($1,$2)',
        [game.gameId,JSON.stringify(game)]
      );
  
      console.log('game inserted successfully');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
   
  }

  findGame = async (gameId:number): Promise<GameModel | null> => {
  
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM game where id=$1',[gameId]); 
      if(result.rows.length>0)
        return  result.rows[0].data
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
   
    return null;
  }

  
}

