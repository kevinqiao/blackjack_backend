import { EventModel } from "src/model/event.model"
import { Injectable } from '@nestjs/common';
import { CustomEvent } from 'src/event/custom.event';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { SocketGateway } from "src/gateway/socket.gateway";
import { Logger } from '@nestjs/common';
@Injectable()
@EventsHandler(CustomEvent)
export class EventService implements IEventHandler<CustomEvent>  {
    private logger: Logger = new Logger('EventService');
    private tableSubscribers=new Map<string,string[]>();
    constructor(private readonly socketGateway:SocketGateway) {
    
    }
    handle(event: CustomEvent) {
 
        if(event?.name==="loginSuccess"&&event.data.tableId){
            this.subscribeTable(event.data.uid,event.data.tableId)
            
        }
    }
    private subscribeTable=(uid:string,tableId:string)=>{
        let subscribers:string[] = this.tableSubscribers.get(tableId);
        if(!subscribers){
          subscribers=[];
          this.tableSubscribers.set(tableId+"",subscribers)
        }
        if(!subscribers.includes(uid)){
            subscribers.push(uid)
        }
    }
    private unsubscribeTable=(uid:string,tableId:string)=>{
        const subscribers:string[] = this.tableSubscribers.get(tableId+"");
        if(subscribers&&!subscribers.includes(uid)){
            subscribers.push(uid)
        }
    }
    sendEvent=(event:EventModel)=>{
        // if(event?.name!=="initGame")
        //    console.log(event)
        if(event?.name==="joinTable"){
            this.subscribeTable(event.selector.uid,event.selector.tableId+"")
        }else if(event?.name==="leaveTable"){
            this.unsubscribeTable(event.selector.uid,event.selector.tableId+"")
        }       
        const subscribers = this.tableSubscribers.get(event.selector.tableId+"");    
        if(subscribers){
            for(const subscriber of subscribers){
                delete event['selector']
                this.socketGateway.sendToClient(subscriber,event).then(()=>null)
            }
        }
    }

}

