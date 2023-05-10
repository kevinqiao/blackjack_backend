export declare type ActionTurn = {
  id: number;
  gameId:number;
  tableId:number;
  round: number;
  expireTime: number;
  seat: number;
  data: any | null;
};
