
import { Injectable } from "@nestjs/common";
import { GameEngine } from "src/service/gameEngine.service";
import { SeatModel,GameModel } from "../model";


@Injectable()
export class StandProcessor{
     constructor(
        private readonly gameEngine:GameEngine
     ){

     }
      process = (gameObj: GameModel) => {

        const seat = gameObj.seats.find((s: SeatModel) => s.no === gameObj.currentTurn.seat);
       
        if (seat) {
            const currentSlot = seat.slots.find((s) => s.id === seat.currentSlot);

            if (currentSlot) {
                currentSlot.status = 1;
                if (this.gameEngine.turnSlot(gameObj, seat)) {
                    return;
                }

                seat.status = 1;
                if (this.gameEngine.turnSeat(gameObj, seat)) {
                    return;
                }
                this.gameEngine.turnDealer(gameObj);
                gameObj.status = 1;
            }
        }
    }

 

}

