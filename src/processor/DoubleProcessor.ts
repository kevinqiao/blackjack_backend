
import { EventService } from "src/service/event.service";
import { GameEngine } from "src/service/gameEngine.service";
import { SeatBetSlot, SeatModel,GameModel} from "../model";

export class DoubleProcessor{
    constructor(
        private readonly gameEngine:GameEngine,
        private readonly eventService:EventService
    ){}
     process = (gameObj: GameModel) => {

        const seat = gameObj.seats.find((s: SeatModel) => s.no === gameObj.currentTurn.seat);
        if (!seat)
            return null;
        const currentSlot = seat.slots?.find((s: SeatBetSlot) => s.id === seat.currentSlot);
        if (currentSlot) {
            let card = this.gameEngine.releaseCard(gameObj, seat.no, currentSlot.id);
            if (card) {
                const data = { seat: seat.no, no: card.no }
                currentSlot.cards.push(card.no)
                this.eventService.sendEvent({ name: "releaseCard", topic: "model", data, delay: 0 });
            }
            this.eventService.sendEvent({
                name: "doubleBet", topic: "model", data: { seatNo: seat.no }, delay: 10
            })

            seat.status = 1;
            if (this.gameEngine.turnSeat(gameObj, seat)) {
                return;
            }
            this.gameEngine.turnDealer(gameObj);
        }
    }
  

}

