
import { Injectable } from "@nestjs/common";
import { EventService } from "src/service/event.service";
import { SeatModel,GameModel,EventModel} from "../model";


@Injectable()
export class DealProcessor {
    constructor(
        private readonly eventService:EventService
    ){

    }
    process = (game: GameModel,seatNo:number,chips:number) => {
        const seat:SeatModel|undefined= game.seats.find((s)=>s.no===seatNo);
        if(seat&&chips>0){
            console.log("deal processing at seat:"+seatNo+" with chips:"+chips)
            seat.bet=chips;
            const event: EventModel = { name: "placeBet", topic: "model", data:{seatNo:seatNo,chips:chips}, delay: 0 }
            this.eventService.sendEvent(event)
       }
    }


}

