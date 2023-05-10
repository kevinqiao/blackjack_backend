
import { Injectable } from "@nestjs/common";
import { EventService } from "src/service/event.service";
import { SeatModel,GameModel } from "../model";
import ActionType from "../model/game/ActionType";


@Injectable()
export class InsureProcessor {
    constructor(private readonly eventService:EventService){}
    process = (gameObj: GameModel) => {

        const seat = gameObj.seats.find((s: SeatModel) => s.no === gameObj.currentTurn.seat);
        if (!seat)
            return null;
        seat.acted.push(ActionType.INSURE)
       
    }

}

