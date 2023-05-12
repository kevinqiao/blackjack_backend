import { Logger } from '@nestjs/common';
import { Injectable } from "@nestjs/common";
import { TurnService } from "src/service/actTurn.service";
import { EventService } from "src/service/event.service";
import { GameEngine } from "src/service/gameEngine.service";
import { SeatBetSlot, SeatModel,GameModel } from "../model";
import Constants from "../model/Constants";




@Injectable()
export class HitProcessor {
    private logger: Logger = new Logger('HitProcessor');
    constructor(
        private readonly gameEngine:GameEngine,
        private readonly eventService:EventService,
        private readonly turnService:TurnService
    ){}
    process = (gameObj: GameModel) => {
        this.logger.log(gameObj.seats);
        this.logger.log(gameObj.currentTurn)
        const seat = gameObj.seats.find((s: SeatModel) => s.no === gameObj.currentTurn.seat);
        this.logger.log(seat)
        if (!seat)
            return null;

        const currentSlot = seat.slots?.find((s: SeatBetSlot) => s.id === seat.currentSlot);
        this.logger.log(currentSlot)
        if (currentSlot) {
            let card = this.gameEngine.releaseCard(gameObj, seat.no, currentSlot.id);
            if (card) {
                const data = { seat: seat.no, no: card.no }
                currentSlot.cards.push(card.no)
                this.eventService.sendEvent({ name: "releaseCard", topic: "model", selector:{tableId:gameObj.tableId},data, delay: 0 });
            }
            const cards = gameObj.cards.filter((c) => currentSlot.cards.includes(c.no));
            const scores = this.gameEngine.getHandScore(cards);
            if (scores.length === 0 || scores.includes(21)) {
                currentSlot.status = 1;
                if (this.gameEngine.turnSlot(gameObj, seat)) {
                    return;
                }
                seat.status = 1;      
                if (this.gameEngine.turnSeat(gameObj, seat)) {
                    return;
                }
                this.gameEngine.turnDealer(gameObj);
                gameObj.status=1;
                // tournamentService.handleGameOver(gameObj)

            } else {
               
                
                Object.assign(gameObj.currentTurn, { id: Date.now(), expireTime: Date.now() + Constants.TURN_INTERVAL, acts: [] })
                this.turnService.newActionTurn(gameObj.currentTurn,100);
                // createEvent({ name: "createNewTurn", topic: "model", data: Object.assign({}, gameObj.currentTurn, { expireTime: Constants.TURN_INTERVAL }), delay: 100 })
            }

        }

    }


}

