
import { Injectable } from "@nestjs/common";
import { GameEngine } from "src/service/gameEngine.service";
import { SeatModel,GameModel } from "../model";

@Injectable()
export class SplitProcessor {
    constructor(
        private readonly gameEngine:GameEngine
    ){}
    process = (gameObj: GameModel) => {

        const seat = gameObj.seats.find((s: SeatModel) => s.no === gameObj.currentTurn.seat);
        if (!seat)
            return null;
        if (this.gameEngine.splitSlot(gameObj, seat)) {
            const currentSlot = seat.slots.find((s) => s.id === seat.currentSlot);
            if (currentSlot) {
                const cards = gameObj.cards.filter((c) => currentSlot.cards.includes(c.no));
                const scores = this.gameEngine.getHandScore(cards);
                if (scores.length === 0 || scores.includes(21)) {
                    currentSlot.status = 1;
                    if (this.gameEngine.turnSlot(gameObj, seat)) {
                        return;
                    }
                    if (this.gameEngine.turnSeat(gameObj, seat)) {
                        seat.status = 1;
                        return;
                    }
                    this.gameEngine.turnDealer(gameObj);

                }
            }
        }

    }

}
