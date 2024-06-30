import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';




const enum events {
  CLIENTS_UPDATED = 'clients-updated',
  MESSAGGE_FROM_SERVER = 'message-from-server',
  MESSAGE_FROM_CLIENT = 'message-from-client'
}
@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() server: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}
  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try{
      payload = this.jwtService.verify(token);
      await this.messagesWsService.regiterClient(client, payload.id);
    } catch(e) {
      client.disconnect(true)
      return;
    }

    // console.log({payload})
    



    this.server.emit(events.CLIENTS_UPDATED,this.messagesWsService.getConnectedClients())

    console.log({conectados: this.messagesWsService.getConnectedClients()})
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.server.emit(events.CLIENTS_UPDATED,this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage(events.MESSAGE_FROM_CLIENT)
  handleMessages(client: Socket, payload: NewMessageDto) {
    console.log(client)
    this.server.emit(events.MESSAGGE_FROM_SERVER, {
      fullName: this.messagesWsService.getUserFullName(client.id), 
      message: payload.message
    });
  }

  
  


}
