import { EventModel } from "src/model/event.model"
import { Injectable } from '@nestjs/common';
import { SocketGateway } from "src/gateway/socket.gateway";
import { Logger } from '@nestjs/common';
@Injectable()
export class EventService {
    private logger: Logger = new Logger('EventService');
    private tableSubscribers=new Map<number,string[]>();
    constructor(private readonly socketGateway:SocketGateway) {
    
    }
    private subscribeTable=(uid:string,tableId:number)=>{
        let subscribers:string[] = this.tableSubscribers.get(tableId);
        if(!subscribers){
          subscribers=[];
          this.tableSubscribers.set(tableId,subscribers)
        }
        if(!subscribers.includes(uid)){
            subscribers.push(uid)
        }
    }
    private unsubscribeTable=(uid:string,tableId:number)=>{
        const subscribers:string[] = this.tableSubscribers.get(tableId);
        if(subscribers&&!subscribers.includes(uid)){
            subscribers.push(uid)
        }
    }
    sendEvent=(event:EventModel)=>{
        this.logger.log(event)
        if(event?.name==="joinTable"){
            this.subscribeTable(event.selector.uid,event.selector.tableId)
        }else if(event?.name==="leave"){
            this.unsubscribeTable(event.selector.uid,event.selector.tableId)
        }
        const subscribers = this.tableSubscribers.get(event.selector.tableId);
        this.logger.log(subscribers)
        if(subscribers){
            for(const subscriber of subscribers){
                delete event['selector']
                this.socketGateway.sendToClient(subscriber,event).then(()=>null)
            }
        }
    }

}

