import { ActionTurn } from "./ActionTurn";
import { CardModel } from "./Card";
import { SeatModel } from "./Seat";
import { SlotBattleResult } from "./SlotBattleResult";

export declare type GameModel = {
  gameId: number;
  ver: number;
  currentCardIndex?:number;
  tournamentId: number;
  tableId: number;
  startSeat: number;
  round: number;//0-place bet 1-in play 2-settled
  cards: CardModel[];
  seats: SeatModel[];
  currentTurn: ActionTurn;
  status: number;//0-open 1-over 2-settled 3-cancelled
  results?: SlotBattleResult[];
};
