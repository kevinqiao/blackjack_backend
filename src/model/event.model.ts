export declare type EventModel = {
    name: string;
    topic: string;
    selector?:{uid?:string,tableId?:number,gameId?:number};
    time?:number;
    delay: number;
    data?: any;
  };