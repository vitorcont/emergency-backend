import { SocketUser } from './entities/navigation-socket.entity';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NavigationSocketService } from './navigation-socket.service';

@WebSocketGateway({ namespace: 'navigation-socket' })
export class NavigationSocketGateway {
  constructor(
    private readonly navigationSocketService: NavigationSocketService,
  ) {}

  private logger: Logger = new Logger('MessageGateway');

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    this.server.emit('success', {
      client: client.id,
    });
  }

  @SubscribeMessage('registerUser')
  createRoom(
    @MessageBody() socketUser: SocketUser,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user-${socketUser.userId}`);
    this.server
      .to(`user-${socketUser.userId}`)
      .emit('roomCreated', { room: `user-${socketUser.userId}` });
  }

  @SubscribeMessage('startTrip')
  findAll(client: Socket) {
    const room = Array.from(client.rooms).find((item) =>
      item.includes('user-'),
    );
    this.server.to(room).emit('tripPath', { room });
  }

  @SubscribeMessage('updateLocation')
  verifyPath(@ConnectedSocket() client: Socket) {
    const room = Array.from(client.rooms).find((item) =>
      item.includes('user-'),
    );
    return '';
  }

  @SubscribeMessage('endTrip')
  endSession(@ConnectedSocket() client: Socket) {
    const room = Array.from(client.rooms).find((item) =>
      item.includes('user-'),
    );
    client.leave(room);
    client.disconnect;

    return '';
  }
}
