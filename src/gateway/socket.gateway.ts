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
  import { Logger } from '@nestjs/common';
  import { Server,Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';

  @Injectable()
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class SocketGateway implements OnGatewayConnection {
    private logger: Logger = new Logger('SocketGateway');
    private sockets=new Map<string,Socket>();
    private userMappings = new Map<string,string>();
    constructor(private readonly authService:AuthService){
      console.log("gateway created")
    }
   async handleConnection(client: Socket, ...args: any[]) {
      client.on("disconnect",(reason)=>{
          const clientId = client.id;
          const uid = this.userMappings.get(clientId);
          this.sockets.delete(uid);
          this.userMappings.delete(clientId)
      })
      const params = client.handshake.query;  
      let uid:string =params['uid']&&typeof params['uid']==="string"?params['uid']:null;
      let token:string =params['token']&&typeof params['token']==="string"?params['token']:null;
      if(token){
        const payload =  await  this.authService.verifyToken(token);
        this.logger.log(payload)
        if(payload){
      // }
      // if(params['uid']&&Array.isArray(params['uid'])) 
      //      uid = params['uid'][0]     
      // if(uid){
            const uid = payload.sub;
            this.sockets.set(uid,client);
            this.userMappings.set(client.id,uid);
            console.log("connection created id:"+client.id+" for uid:"+uid)
        }
      }

    }
    // @WebSocketServer()
    // server: Server;

    // @Bind(MessageBody(), ConnectedSocket())
    // @SubscribeMessage('events')
    // async handleNewMessage(event:any, sender: any) {
    //   console.log(event)
    //   console.log("socketId:"+sender.id)
    // }
  
    // @SubscribeMessage('identity')
    // async identity(@MessageBody() data: number): Promise<number> {
    //   return data;
    // }
    async sendToClient(uid:string,data:any):Promise<void>{
  
      const client = this.sockets.get(uid);
      if(client){
        client.emit("events",data)
      }
    }
  }