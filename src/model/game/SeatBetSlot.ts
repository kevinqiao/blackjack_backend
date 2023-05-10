export declare type SeatBetSlot = {
  id: number;
  cards: number[];
  score?: number;//0-bust 
  status: number;//0-active 1-dealed 2-settle
};
