import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Header, Headers, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  ConnectedSocket,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { GroupMapping } from './entity/groupMapping.entity';

@WebSocketGateway(80, { namespace: /\/chat\/.+/, transports: ['websocket'], cors: { origin: ['*'] } }) // 80번 포트, /chat/${groupID} 접속
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(GroupMapping) private groupMappingEntity: Repository<GroupMapping>,
    private userService: UserService,
  ) { }

  @WebSocketServer()
  public server: Server;

    // 초기화 시 실행
  async afterInit() {
    console.log('WebSocket had initted');
  }

  // 소켓 연결 시 실행
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // JWT 유효성 검사
    const { userID } = await this.userService.validateAccess(socket.handshake.headers.authorization);

    // 유저가 속한 채팅방 찾기
    const groupList = await this.groupMappingEntity.findBy({ userID });
    
    // 클라이언트 연결 알림
    console.log(`Client ${socket.id} has connected`);

    // 유저가 속한 채팅방에 접속
    for (let i = 0; i < groupList.length; i++){
      socket.join(groupList[i].groupID.toString());
      console.log(`join to ${groupList[i].groupID}`);
    }
  }

  // 소켓 연결이 끊길 경우 실행
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`Client ${socket.id} has disconnected`);
  }
}