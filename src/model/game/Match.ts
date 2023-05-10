import { TableSeat } from "./TableSeat";

export declare type MatchModel = {
  id: number;
  tournamentId: number;
  seats: TableSeat[];
  games: number[];
  status: number;//0-in progress,1-completed 2-settled;
};
