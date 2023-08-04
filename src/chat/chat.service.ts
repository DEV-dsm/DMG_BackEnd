import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/createMessage.dto';
import { Chatting } from './entity/chatting.entity';
import { Group } from './entity/group.entity';
import { GroupMapping } from './entity/groupMapping.entity';

// @UseFilters(new HttpExceptionFilter())
@Injectable()
export class ChatService {
    constructor(
        private readonly chatGateway: ChatGateway,
        private userService: UserService,
        @InjectRepository(Group) private groupEntity: Repository<Group>,
        @InjectRepository(GroupMapping) private groupMappingEntity: Repository<GroupMapping>,
        @InjectRepository(Chatting) private chattingEntity: Repository<Chatting>,
        @InjectRepository(User) private userEntity: Repository<User>,
    ) {

    }

    async createMessage(accesstoken: string, createMessageDto: CreateMessageDto): Promise<boolean> {
        // JWT 유효성 검사
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 파라미터 분리
        const { groupID, body } = createMessageDto;

        // 이 그룹이 존재하는 아이디의 그룹인지 확인
        const thisGroup = await this.groupEntity.findOneBy({ groupID });
        if (!thisGroup) throw new NotFoundException();

        // 이 그룹에 메시지를 보내는 멤버가 있는지 확인
        const thisMapping = await this.groupMappingEntity.findOneBy({ groupID, userID });
        if (!thisMapping) throw new ConflictException();

        // DB 저장 ( 47 ~ 54번째 줄 )
        const thisMessage = new Chatting();

        thisMessage.groupID = groupID;
        thisMessage.userID = userID;
        thisMessage.body = body;
        thisMessage.thisUser = await this.userEntity.findOneBy({ userID });
        thisMessage.thisGroup = thisGroup;

        await this.chattingEntity.save(thisMessage);

        // 서버에 이벤트 발생
        const sending = this.chatGateway.server.to(`${groupID}`).emit('message', { message: body });

        return sending;
    }

    async getGroupInfo(accesstoken: string, groupID: number) {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 그룹 존재 여부 확인
        const thisGroup = await this.groupEntity.findOneBy({ groupID });
        if (!thisGroup) throw new NotFoundException();

        // 그룹 소속 여부 확인
        const thisGroupMapping = await this.groupMappingEntity.findOneBy({ groupID, userID });
        if (!thisGroupMapping) throw new ForbiddenException();

        // 채팅방에 속한 유저 정보와 관리자 확인
        const count = await this.groupMappingEntity
            .createQueryBuilder('qb')
            .innerJoin('qb.user', 'user')
            .select(['qb.isManager', 'identify', 'name', 'profile'])
            .where('qb.groupID = :groupID', { groupID })
            .orderBy('isManager', 'DESC')
            .getRawMany();
        
        return count;
    }
}