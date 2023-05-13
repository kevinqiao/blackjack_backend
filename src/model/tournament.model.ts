

export declare type TournamentModel = {
  id: number;
  type: number;//0-free 1-buyin 2-friends
  buyIn?:{amount:number;asset:number};
  bet?:{min:number;max:number}
  rewards?: TournamentReward[];
  startingStack: number;
  minPlayers: number;
  minBet:number;
  maxBet:number;
  rounds: number;
  status: number;//0-open 1-in work
};
export declare type TournamentReward={
  rank:number;
  assets:{amount:number;type:number};
}
