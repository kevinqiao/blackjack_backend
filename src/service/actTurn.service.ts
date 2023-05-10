
import { Injectable } from "@nestjs/common";
import { TurnDao } from "src/respository/TurnDao";
import { ActionTurn } from "../model/game/ActionTurn";

import { EventService } from "./event.service";


@Injectable()
export class TurnService {
    constructor(
        private readonly eventService:EventService,
        private readonly turnDao:TurnDao
        ) {
    
    }

    newActionTurn = async(turn:ActionTurn,delay:number):Promise<void>=> {
  
        if(turn?.expireTime){
            const timeout =turn.expireTime-Date.now()-delay;
            if(timeout>0){
                const preturn = await this.turnDao.find(turn.gameId);
                if(preturn)
                  await this.turnDao.update(turn)
                else
                  await this.turnDao.create(turn)
            }else
                await this.turnDao.remove(turn.gameId)
            this.eventService.sendEvent({ name: "createNewTurn", topic: "model", selector:{tableId:turn.tableId},data: {...turn,expireTime:timeout}, delay: delay})
        }
    }

    stopCount=(gameId:number)=>{
        this.turnDao.remove(gameId).then(()=>console.log("clear turn for gameId:"+gameId))
    }

 
}

