
import { Injectable } from "@nestjs/common";
import { TurnService } from "src/service/actTurn.service";
import { EventService } from "src/service/event.service";
import { GameEngine } from "src/service/gameEngine.service";
import { CardModel, SeatModel,ActionTurn,GameModel } from "../model";
import { Logger } from '@nestjs/common';
import Constants from "../model/Constants";

@Injectable()
export class LaunchProcessor {
    private logger: Logger = new Logger('LaunchProcessor');
    constructor(
        private readonly eventService:EventService,
        private readonly gameEngine:GameEngine,
        private readonly turnService:TurnService
    ){}


    process = (game: GameModel) => {
        game.round = 1;
        // createEvent({ name: "startPlay", topic: "", data: { round: 1 }, delay: 0 })
        this.eventService.sendEvent({ name: "startPlay", topic: "", selector:{tableId:game.tableId},data: { round: 1 }, delay: 0 })
        let time = 0;
        this.logger.log("start seat:"+game.startSeat)
        let firstTurnSeat:SeatModel;
        for (let i = 0; i < 3; i++) {
            const no = game.startSeat + i >= 3 ? game.startSeat + i - 3 : game.startSeat + i;
            const seat = game.seats.find((s: SeatModel) => s.no === no&&s.bet>0);
            if (seat) {
                if(!firstTurnSeat)
                   firstTurnSeat = seat;
                let card = this.gameEngine.releaseCard(game, seat.no, seat.currentSlot);
                if (card?.no) {
                    let card1 = card.no;
                    seat.slots[0].cards.push(card1)
                    time = (i + 1) * 500;
                    // createEvent({ name: "releaseCard", topic: "model", data: { seat: seat.no, no: card1 }, delay: time })
                    this.eventService.sendEvent({ name: "releaseCard", topic: "model", selector:{tableId:game.tableId},data: { seat: seat.no, no: card1 }, delay: time })
                    card = this.gameEngine.releaseCard(game, seat.no, seat.currentSlot);
                    if (card?.no) {
                        time = time + 300;
                        let card2 = card.no
                        seat.slots[0].cards.push(card2)
                        this.eventService.sendEvent({ name: "releaseCard", topic: "model",selector:{tableId:game.tableId},  data: { seat: seat.no, no: card2 }, delay: time })
                    }
                    const seatCards = game.cards.filter((c) => seat.slots[0].cards.includes(c.no));
                    const scores = this.gameEngine.getHandScore(seatCards);
                    if (scores.includes(21)) {
                        seat.status = 1;
                        this.gameEngine.turnSeat(game, seat)
                    }
                }
            }
        }

        const dealerSeat = game.seats.find((s: SeatModel) => s.no === 3);
        if (dealerSeat) {
            time = time + 300
            dealerSeat.slots.push({ id: Date.now() + 10, cards: [], status: 0 })
            const dealerCard: CardModel | null = this.gameEngine.releaseCard(game, dealerSeat.no, dealerSeat.currentSlot);
            if (dealerCard) {
                dealerSeat.slots[0]['cards'].push(dealerCard.no)
                // setTimeout(() => setAction({ id: Date.now(), name: "releaseCard", seat: size, data: { seat: size, no: dealerCard.no } }), time)
                this.eventService.sendEvent({ name: "releaseCard", topic: "model",selector:{tableId:game.tableId}, data: { seat: 3, no: dealerCard.no }, delay: time })
                // setTimeout(() => setAction({ id: Date.now(), name: "releaseCard", seat: size, data: { seat: size, no: 0 } }), time + 250)
            }
        }
        // let startSeat=game.seats.find((s)=>s.no===game.startSeat);
        
        // let seatSize = game.seats.filter((s)=>s.no<3).length;
        // if(seatSize>1){
        //     for (let i = 0; i < 3; i++) {
        //             const no = game.startSeat + i >= 3 ? game.startSeat + i - 3 : game.startSeat + i;
        //             startSeat = game.seats.find((s: SeatModel) => s.no === no&&s.bet>0);
        //             if (startSeat)
        //                 break;
        //     }
        // }
        // console.log(startSeat)
        // startSeat = game.seats.find((s) => s.no === game.startSeat);
        // this.logger.log(startSeat)
        if (firstTurnSeat) {
            // this.logger.log(firstTurnSeat)
            if (firstTurnSeat.status === 0) {
                time = time + 100;
                const actionTurn: ActionTurn = { id: Date.now() + 2,gameId:game.gameId, round: 1, tableId:game.tableId, expireTime: Date.now() + Constants.TURN_INTERVAL +time, seat: firstTurnSeat.no, data: null }
                game.currentTurn = actionTurn;
                game.round=1;
                this.turnService.newActionTurn(actionTurn,time);
                return;
            }
            if (this.gameEngine.turnSeat(game, firstTurnSeat))
                return;
            this.gameEngine.turnDealer(game)
            game.status = 1;
        }
    }



}



