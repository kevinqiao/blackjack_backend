import { Injectable } from "@nestjs/common";
import { UserModel } from "./user.model";
import { PostgreSqlConnector } from "./postgresql.dbconnector";
import { Logger } from '@nestjs/common';
@Injectable()
export class UserDao {
  private logger: Logger = new Logger('UserDao');
  constructor(private readonly postsqlDBConnector:PostgreSqlConnector){}
   updateUser = async (data: any) => {
      const pool = this.postsqlDBConnector.getConnection();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Lock the row for update
        const lockQuery = 'SELECT * FROM account WHERE uid = $1 FOR UPDATE';
        const result =await client.query(lockQuery, [data.uid]);
        
        if(result.rows.length>0){
           const user = result.rows[0]['data']
           Object.assign(user,data)    
           this.logger.log(user)
          // Update the row with new JSON data
          const updateQuery = 'UPDATE account SET data = $1 WHERE uid = $2';
          await client.query(updateQuery, [user, data.uid]);
        }
        // Commit the transaction
        await client.query('COMMIT');
        console.log('Updated account data for id:', data.uid);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating JSON data:', error);
      } finally {
        client.release();
      }
  }
   createUser =async (user: UserModel) => {
    
      
        const pool = this.postsqlDBConnector.getConnection();
        const client = await pool.connect();
        try {
          
          // Create a table with a JSONB column
          await client.query(`
            CREATE TABLE IF NOT EXISTS account (
              uid varchar(80) PRIMARY KEY,
              channelUID varchar(80),
              data JSONB
            );
          `);

          // Insert JSON data into the JSONB column
          await client.query(
            'INSERT INTO  account (uid,channelUID,data) VALUES ($1,$2,$3)',
            [user.uid,user.channelUID,JSON.stringify(user)]
          );

          console.log('account inserted successfully');
        } catch (err) {
          console.error('Error:', err);
        } finally {
          client.release(); // Close the database connection
        }
   
  }
  find = async (uid:string): Promise<UserModel | null> => {

    const pool = this.postsqlDBConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM account where uid=$1',[uid]); 
      if(result.rows.length>0)
        return  result.rows[0]['data']
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
   
    return null;
  }
  findByChannelUID = async (uid:string): Promise<UserModel | null> => {

    const pool = this.postsqlDBConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM account where channelUid=$1',[uid]); 
      if(result.rows.length>0)
        return  result.rows[0]['data']
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
   
    return null;
  }
  findAll = async (): Promise<UserModel[]> => {
    const users:UserModel[]=[];
    const pool = this.postsqlDBConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM account'); 
      const rows = await result.rows.reduce((acc, row) => {
        acc.push(row.data);
        return acc;
      }, []);
      if(rows.length>0)
        users.push(...rows)
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
   
    return users;
  }
  removeAll = async (): Promise<void> => {

    const pool = this.postsqlDBConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('delete FROM account'); 
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
  }

}

