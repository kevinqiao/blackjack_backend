
import { Injectable } from "@nestjs/common";
import { TurnService } from "src/service/actTurn.service";
import { GameEngine } from "src/service/gameEngine.service";
import { ActionTurn,GameModel,EventModel} from "../model";
import Constants from "../model/Constants";
import {EventService} from "../service/event.service";

@Injectable()
export class InitGameProcessor  {
    constructor(
        private readonly eventService:EventService,
        private readonly turnService:TurnService,
        private readonly gameEngine:GameEngine,
    ){}
    process = (game: GameModel,delay:number) => {
        game.cards=this.gameEngine.shuffle();
        const event: EventModel = { name: "initGame", topic: "model",selector:{tableId:game.tableId}, data: JSON.parse(JSON.stringify(game)), delay: delay }
        // createEvent(event);
        this.eventService.sendEvent(event)
        const actionTurn: ActionTurn = { id: Date.now() + 2,gameId:game.gameId, round: 0, tableId:game.tableId, expireTime: Date.now() + Constants.TURN_INTERVAL + 500, seat: -1, data: null }
        game.currentTurn = actionTurn;
        game.round=0;
        this.turnService.newActionTurn(actionTurn,delay+100);

    }

   
}

