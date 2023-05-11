import { Injectable } from "@nestjs/common";
import { TableModel } from "../model";
import { PostgreSqlConnector } from "./postgresql.dbconnector";
@Injectable()
export class TableDao{

 constructor(private readonly postsqlConnector:PostgreSqlConnector){}
 updateTable =async (data: any) => {
  const pool = this.postsqlConnector.getConnection();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the row for update
    const lockQuery = 'SELECT * FROM game_table WHERE id = $1 FOR UPDATE';
    await client.query(lockQuery, [data.id]);

    // Update the row with new JSON data
    const updateQuery = 'UPDATE game_table SET data = $1 WHERE id = $2';
    await client.query(updateQuery, [data, data.id]);

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Updated game_table data for id:', data.id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating JSON data:', error);
  } finally {
     client.release();
  }
    
}
createTable = async(table: TableModel) => {
   
  const pool = this.postsqlConnector.getConnection();
  const client = await pool.connect();
  try {
    
    // Create a table with a JSONB column
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_table (
        id bigint PRIMARY KEY,
        tournamentId bigint,
        data JSONB
      );
    `);
    
    // Insert JSON data into the JSONB column
    await client.query(
      'INSERT INTO  game_table (id,tournamentId, data) VALUES ($1,$2,$3)',
      [table.id,table.tournamentId,JSON.stringify(table)]
    );

   
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release(); // Close the database connection
  }
   
}

findTable = async (id: number): Promise<TableModel | null> => {

    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM game_table where id=$1',[id]); 

      if(result.rows.length>0)
        return  result.rows[0].data
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
   
    return null;
  }
 
  findTournamentTables = async (tournamentId: number): Promise<TableModel[] | null> => {
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM game_table where tournamentId=$1',[tournamentId]); 
      const rows = result.rows.reduce((acc, row) => {
        acc.push(row.data);
        return acc;
      }, []);
      return rows;
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
    return null;
  }
  
 
}

