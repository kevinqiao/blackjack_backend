import { Injectable } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
    OnGatewayConnection
  } from '@nestjs/websockets';
  import { Bind} from '@nestjs/common';
  import { from, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Server } from 'socket.io';

  @Injectable()
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class EventsGateway implements OnGatewayConnection {
    constructor(){
      console.log("gateway created")
    }
    handleConnection(client: any, ...args: any[]) {
      client.on("disconnect",(reason)=>{
          console.log("disconnected:"+reason+" id:"+client.id);
      })
      console.log(client.conn.transport.name)
      console.log(client.handshake.query)
      const params = client.handshake.query;  
      console.log(params?params['a']:"")
      console.log("connection created id:"+client.id)
      this.server.sockets.emit("events",{name:"test"})
    }
    @WebSocketServer()
    server: Server;

    @Bind(MessageBody(), ConnectedSocket())
    @SubscribeMessage('events')
    async handleNewMessage(event:any, sender: any) {
      console.log(event)
      console.log("socketId:"+sender.id)
    }
  
    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
      return data;
    }
    async sendToClient(data:any):Promise<void>{
      const sockets = await this.server.fetchSockets();
      for(let socket of sockets){
         console.log("socket id:"+socket.id);
         socket.emit("events",data)
      }
        
    }
  }