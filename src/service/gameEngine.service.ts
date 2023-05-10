
import { CardModel, GameModel, SeatBetSlot, SeatModel } from "../model";
import ActionType from "../model/game/ActionType";
import Constants from "../model/Constants";
import { TurnService } from "./actTurn.service";
import { EventService } from "./event.service";
import { Injectable } from "@nestjs/common";
const make_deck = () => {
    const cards: CardModel[] = [];
    let no = 0;
    let j = 0;
    let v = "";
    for (let i = 2; i <= 14; i++) {
        v = i + "";
        switch (i) {
            case 14:
                v = "A";
                break;
            case 11:
                v = "J";
                break;
            case 12:
                v = "Q";
                break;
            case 13:
                v = "K";
                break;
            default:
                break;
        }
        cards[j++] = { no: ++no, value: v, rank: i, suit: "h", seat: -1, slot: 0 };
        cards[j++] = { no: ++no, value: v, rank: i, suit: "d", seat: -1, slot: 0 };
        cards[j++] = { no: ++no, value: v, rank: i, suit: "c", seat: -1, slot: 0 };
        cards[j++] = { no: ++no, value: v, rank: i, suit: "s", seat: -1, slot: 0 };
    }
    // console.log(cards)
    return cards;
};
const cards =[3,17,49,38,7,9]
@Injectable()
export class GameEngine{
   constructor(
    private readonly turnService:TurnService,
    private readonly eventService:EventService
   ){}
    shuffle = (): CardModel[] => {
        return make_deck()
    }
    releaseCard = (game: GameModel, seatNo: number, slotId: number): CardModel | null => {
        if (game) {
            if(!game.currentCardIndex)
             game.currentCardIndex=0;
            const cardIndex = game.currentCardIndex++;
            const releaseds = game.seats.map((s: any) => s["slots"].map((c: SeatBetSlot) => c["cards"])).flat(2);
            const toReleases = game.cards.filter((c: CardModel) => !releaseds.includes(c.no));
            const no = Math.floor(Math.random() * toReleases.length);
            const card = toReleases[no];
            //  const index= getCardIndex();
            // console.log("index:"+cardIndex)
            // const card = game.cards.find((c)=>c.no=== cards[cardIndex]);
     
                card['seat'] = seatNo;
                card['slot'] = slotId;

                return card;

            // console.log(card)
            
        } else
            return null

    }
    getActs = (game: GameModel, seatNo: number) => {
        const acts = [ActionType.HIT, ActionType.STAND];
        const seat = game.seats.find((s) => s.no === seatNo);
        const currentSlot = seat?.slots.find((s) => s.id === seat.currentSlot);
        if (game?.cards && currentSlot?.cards.length === 2) {
            if (seat?.slots?.length === 1) {
                acts.push(ActionType.DOUBLE, ActionType.SURRENDER);
                const dealerSeat = game.seats.find((s) => s.no === 3);
                const card = game.cards.find((c) => c.no === dealerSeat?.slots[0].cards[0]);
                if (card?.rank === 14)
                    acts.push(ActionType.INSURE)
            }
            const splitSeats = seat?.slots.filter((s: SeatBetSlot) => s.status && s.status > 0);
            if (!splitSeats || splitSeats.length === 0) {
                acts.push(ActionType.SPLIT)
            }
        }
        return acts;
    }
    getHandScore = (cards: CardModel[]): number[] => {
        const aces = cards.filter((c) => c.rank === 14);
        const scores: number[] = [];
        const score = cards.filter((c) => c.rank < 14).map((c) => c.rank > 10 ? 10 : c.rank).reduce((a, c) => a + c, 0)
        if (aces?.length > 0) {
            for (let i = 0; i <= aces.length; i++) {
                const ascore = i + (aces.length - i) * 11;
                if ((score + ascore) <= 21)
                    scores.push(score + ascore)
            }
        } else if (score <= 21) {
            scores.push(score)
        }
        return scores;
    }

    turnSeat = (gameObj: GameModel, seat: SeatModel): boolean => {
        let ok = false;
        const nextSeats = gameObj.seats.filter((s)=>s.no!==seat.no);
        if(nextSeats?.length>0)
            for (let i = 1; i < 3; i++) {
                const nextSeatNo = seat.no + i >= 3 ? seat.no + i - 3 : seat.no + i;
                const nextSeat = gameObj.seats.find((s) => s.no === nextSeatNo&&s.bet>0);
                if (nextSeat && nextSeat.status === 0) {
                    // gameObj.currentTurn = { id: Date.now(), gameId:gameObj.gameId,round: 1, expireTime: Date.now() + Constants.TURN_INTERVAL, acts: [], seat: nextSeatNo, data: null }                           
                    Object.assign(gameObj.currentTurn, { id: Date.now(), expireTime: Date.now() + Constants.TURN_INTERVAL, seat: nextSeatNo })
                    this.turnService.newActionTurn(gameObj.currentTurn,10);
                    // createEvent({ name: "createNewTurn", topic: "model", data: Object.assign({}, gameObj.currentTurn, { expireTime: Constants.TURN_INTERVAL }), delay: 10 });
                    ok = true;
                    break;
                }
            }
        return ok;
    }
    turnSlot = (gameObj: GameModel, seat: SeatModel): boolean => {
        let ok = false;
        const activeSlots = seat.slots.filter((s) => s.id != seat.currentSlot && (!s.status || s.status === 0)).sort((a, b) => a.id - b.id);
        for (let i = 0; i < activeSlots.length; i++) {
            let card = this.releaseCard(gameObj, seat.no, activeSlots[i].id);
            if (!card)
                return false;
            activeSlots[i]['cards'].push(card.no)
            seat.currentSlot = activeSlots[i].id;
            this.eventService.sendEvent({ name: "openSlot", topic: "model", data: { seat: seat.no, slot: seat.currentSlot }, delay: Constants.DELAY_TURN_SLOT });
            this.eventService.sendEvent({ name: "releaseCard", topic: "model", data: { seat: seat.no, slot: seat.currentSlot, no: card?.no }, delay: Constants.DELAY_TURN_SLOT + 200 })
            Object.assign(gameObj.currentTurn, { id: Date.now(), expireTime: Date.now() + Constants.TURN_INTERVAL + 200 })
            this.turnService.newActionTurn(gameObj.currentTurn,Constants.DELAY_TURN_SLOT + 300);
            // createEvent({ name: "createNewTurn", topic: "model", data: Object.assign({}, gameObj.currentTurn, { expireTime: Constants.TURN_INTERVAL }), delay: Constants.DELAY_TURN_SLOT + 300 });
            const cards = gameObj.cards.filter((c) => activeSlots[i]['cards'].includes(c.no));
            const scores = this.getHandScore(cards);
            if (scores.length > 0 && !scores.includes(21)) {
                ok = true;
                break;
            }
        }
        return ok
    }
    turnDealer = (gameObj: GameModel) => {
        // turnService.stopCount(gameObj.gameId)
        Object.assign(gameObj.currentTurn, { id: Date.now(), expireTime: Date.now(), seat: 3 })
        this.turnService.newActionTurn(gameObj.currentTurn,10);
        // createEvent({ name: "createNewTurn", topic: "model", data: Object.assign({}, gameObj.currentTurn, { expireTime: 0 }), delay: 10 });
        const dealerSeat = gameObj.seats.find((s) => s.no === 3);
        if (dealerSeat) {
            let i = 0;
            while (true) {
                i++;
                let card = this.releaseCard(gameObj, 3, dealerSeat.currentSlot);
                if (!card)
                    break;
                this.eventService.sendEvent({ name: "releaseCard", topic: "model", data: { seat: 3, no: card?.no }, delay: i * 800 })
                dealerSeat.slots[0]['cards'].push(card.no);
                const dealerCards = gameObj.cards.filter((c) => dealerSeat.slots[0]['cards'].includes(c.no));
                const scores = this.getHandScore(dealerCards);
               
                if (scores.length === 0) {
                    dealerSeat.slots[0]['score'] = 0;
                    dealerSeat.status = 1;
                    break;

                } else {
                    const ascores = scores.filter((s) => s >= 17);
                    if (ascores.length > 0) {
                        dealerSeat.slots[0]['score'] = ascores[0];
                        dealerSeat.status = 1;
                        break;
                    }
                }
            }
        }
    }
    splitSlot = (gameObj: GameModel, seat: SeatModel): boolean => {
        let ok = false;
        const currentSlot = seat.slots.find((s) => s.id === seat.currentSlot);
        if (currentSlot?.cards.length === 2) {
            const transferCardNo = currentSlot.cards[1];
            const newSlot = { id: Date.now(), status: 0, cards: [transferCardNo] }
            seat.slots.push(newSlot);
            const transferCard = gameObj.cards.find((c) => c.no === transferCardNo);
            if (transferCard) {
                transferCard.slot = newSlot.id;
                currentSlot.cards.splice(1, 1);
                let card = this.releaseCard(gameObj, seat.no, seat.currentSlot);
                if (card) {
                    card.seat = seat.no;
                    currentSlot.cards.push(card.no);
                    this.eventService.sendEvent({ name: "splitSlot", topic: "model", data: { seat: seat.no, slot: newSlot }, delay: 10 });
                    this.eventService.sendEvent({ name: "releaseCard", topic: "model", data: { seat: seat.no, no: card.no }, delay: 500 });
                    Object.assign(gameObj.currentTurn, { id: Date.now(), expireTime: Date.now() + Constants.TURN_INTERVAL, seat: seat.no })
                    this.turnService.newActionTurn(gameObj.currentTurn,1000);
   
                    // createEvent({ name: "createNewTurn", topic: "model", data: Object.assign({}, gameObj.currentTurn, { expireTime: Constants.TURN_INTERVAL }), delay: 1000 })
                    ok = true;
                }
            }
        }
        return ok;
    }

}

