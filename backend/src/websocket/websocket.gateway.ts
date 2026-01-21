import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Incident } from '../database/entities/incident.entity';
import { Action } from '../database/entities/action.entity';
import { Approval } from '../database/entities/approval.entity';

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.join('incidents');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastIncidentUpdate(incident: Incident) {
    this.server.to('incidents').emit('incident:update', incident);
  }

  broadcastActionUpdate(action: Action) {
    this.server.to('incidents').emit('action:update', action);
  }

  broadcastApprovalUpdate(approval: Approval) {
    this.server.to('incidents').emit('approval:update', approval);
  }

  @SubscribeMessage('subscribe:incidents')
  handleSubscribe(client: Socket) {
    client.join('incidents');
    return { status: 'subscribed' };
  }
}
