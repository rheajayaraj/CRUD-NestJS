import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const doctorId = client.handshake.query.doctorId;
    if (doctorId) {
      client.join(`doctor-${doctorId}`);
      console.log(`Doctor ${doctorId} connected via socket`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyDoctor(doctorId: string, message: any) {
    this.server
      .to(`doctor-${doctorId}`)
      .emit('appointmentNotification', message);
  }
}
