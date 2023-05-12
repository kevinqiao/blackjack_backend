
import { Injectable } from "@nestjs/common";
import { EventService } from "src/service/event.service";
import { GameEngine } from "src/service/gameEngine.service";
import { TournamentModel,SlotBattleResult,GameModel} from "../model";


@Injectable()
export class SettleGameProcessor {
    constructor(
        private readonly gameEngine:GameEngine,
        private readonly eventService:EventService
    ){}
    process = (game: GameModel) => {
        // if(game.round===0){
        //     createEvent({ name: "clearGame", topic: "model", data: {gameId:game.gameId}, delay: 1000 });
        //     return;
        // }
        const dealerSeat = game.seats.find((s) => s.no === 3);
        if (dealerSeat) {
            const results: SlotBattleResult[] = [];
            const dealerScore = dealerSeat.slots[0]['score']
            if (typeof dealerScore !== "undefined" && dealerScore >= 0) {
                game.seats.filter((s) => s.no !== 3).forEach((s) => {
                    for (let slot of s.slots) {
                        const slotCards = game.cards.filter((c) => slot.cards.includes(c.no))
                        const scores = this.gameEngine.getHandScore(slotCards);
                        const item: SlotBattleResult = { seat: s.no, slot: slot.id, score: scores?.length > 0 ? scores[0] : 0, win: 0, chips: 0 }
                        if (!scores || scores.length === 0 || dealerScore > scores[0]) {
                            item['win'] = 2;
                        } else if (dealerScore === 0 || dealerScore < scores[0]) {
                            item['win'] = 1;
                        }
                        results.push(item)
                    }
                })
                game.status=2;
            }
            game.results = results;
            this.eventService.sendEvent({ name: "settleGame", topic: "model",selector:{tableId:game.tableId}, data: results, delay: 1000 });
        }
   }
  

}

