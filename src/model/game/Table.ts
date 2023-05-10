import { TableSeat } from "./TableSeat";

export declare type TableModel = {
  id: number;
  size: number;
  lastStartSeat:number;
  sits:number;
  seats: TableSeat[];
  tournamentId: number;
  tournamentType:number;//0-free play 1-sngo 2-world 3-friends
  games: number[];
  status: number;//0-open 1-closed
  ver: number
};
