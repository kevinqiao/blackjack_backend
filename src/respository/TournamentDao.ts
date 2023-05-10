import { Injectable } from "@nestjs/common";
import { GameModel,TournamentModel} from "../model";

import { PostgreSqlConnector } from "./postgresql.dbconnector";
@Injectable()
export class TournamentDao{
  constructor(private readonly postsqlConnector:PostgreSqlConnector){}

  updateTournament = (data: any) => {
    if (typeof window !== "undefined") {
      const tournamentsts = window.localStorage.getItem("tournaments");
      if (typeof tournamentsts != "undefined" && tournamentsts != null) {
        let tournaments = JSON.parse(tournamentsts);
        if (tournaments?.length > 0) {
          const tournament = tournaments.find((t: TournamentModel) => t.id === data.id);
          Object.assign(tournament, data);
          window.localStorage.setItem("tournaments", JSON.stringify(tournaments));
        }
      }
    }
  }
  createTournament =async  (tournament:TournamentModel) => {
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      
      // Create a table with a JSONB column
      await client.query(`
        CREATE TABLE IF NOT EXISTS tournament (
          id SERIAL PRIMARY KEY,
          data JSONB
        );
      `);
  
      // Insert JSON data into the JSONB column
      await client.query(
        'INSERT INTO tournament (id,data) VALUES ($1,$2)',
        [tournament.id,JSON.stringify(tournament)]
      );
  
      console.log('Data inserted successfully');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
  }
 
  removeTournament = (id: number) => {
  
  }
  findTournament = async (id: number):Promise<TournamentModel|null> => {
    
    const pool = this.postsqlConnector.getConnection();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM tournament where id=$1',[id]); 
      if(result.rows.length>0)
        return  result.rows[0].data
    } catch (err) {
      console.error('Error:', err);
    } finally {
      client.release(); // Close the database connection
    }
    return null;
  }

  findTournamentsByType = (type: number): TournamentModel[] | null => {
    let tournaments = null;

    return tournaments;
  }
 findAll = async (): Promise<TournamentModel[]>=> {
  const tournaments:TournamentModel[]=[];
  const pool = this.postsqlConnector.getConnection();
  const client = await pool.connect();
  try {
    
    const result = await client.query('SELECT * FROM tournament');
    const rows = result.rows.reduce((acc, row) => {
      acc.push(row.data);
      return acc;
    }, []);
    tournaments.push(...rows)
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release(); // Close the database connection
  }
  return tournaments;
 }
 }