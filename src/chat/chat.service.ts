import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { In, Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/createMessage.dto';
import { InviteMemberDto } from './dto/inviteMember.dto';
import { UpdateGroupInfoDto } from './dto/updateGroupInfo.dto';
import { userPayloadDto } from 'src/user/dto/userPayload.dto';
import { Chatting } from './entity/chatting.entity';
import { Group } from './entity/group.entity';
import { GroupMapping } from './entity/groupMapping.entity';
import { Octokit } from 'octokit';
import { RepoDto } from './dto/repo.dto';
import { CreateGroupDto } from './dto/createGroup.dto';

// @UseFilters(new HttpExceptionFilter())
@Injectable()
export class ChatService {
    constructor(
        private readonly chatGateway: ChatGateway,
        private userService: UserService,
        @InjectRepository(Group) private groupEntity: Repository<Group>,
        @InjectRepository(GroupMapping)
        private groupMappingEntity: Repository<GroupMapping>,
        @InjectRepository(Chatting) private chattingEntity: Repository<Chatting>,
        @InjectRepository(User) private userEntity: Repository<User>,
    ) { }

    async createMessage(
        accesstoken: string,
        createMessageDto: CreateMessageDto,
    ): Promise<boolean> {
        // JWT 유효성 검사
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 파라미터 분리
        const { groupID, body } = createMessageDto;

        // 이 그룹이 존재하는 아이디의 그룹인지 확인
        const thisGroup = await this.groupEntity.findOneBy({ groupID });
        if (!thisGroup) throw new NotFoundException();

        // 이 그룹에 메시지를 보내는 멤버가 있는지 확인
        const thisMapping = await this.groupMappingEntity.findOneBy({
            groupID,
            userID,
        });
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
        const sending = this.chatGateway.server
            .to(`${groupID}`)
            .emit('message', { message: body });

        return sending;
    }

    async readMessage(accesstoken: string, groupID: number): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);

        const thisGroup = await this.groupMappingEntity.findOneBy({
            userID,
            groupID,
        });
        if (!thisGroup) throw new ForbiddenException();

        const thisMessages = await this.chattingEntity.findBy({ groupID });

        return thisMessages;
    }

    async createGroup(accesstoken: string, createGroupDto: CreateGroupDto) {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 파라미터 분리
        const { name, profile, member } = createGroupDto;

        // userID를 포함하는 경우
        if (member.includes(userID)) throw new ConflictException('자신을 포함할 수 없음');

        // 중복값이 존재하는 경우
        if (member.length != new Set(member).size) throw new ConflictException('같은 사람이 여럿 포함될 수 없음');
        
        // 멤버 배열에서 존재하지 않는 유저 필터링
        member.map(async (x, idx) => {
            const existMember = await this.userEntity.findOneBy({ userID: member[idx] });
            if (!existMember) throw new NotFoundException('존재하지 않는 멤버');
        });

        const group = await this.groupEntity.save({
            name,
            profile: profile || ''
        });

        // 채팅방 만든이 추가 및 관리자 할당
        await this.groupMappingEntity.save({
            groupID: group.groupID,
            userID,
            isManager: true
        });

        await this.createMessage(accesstoken, { groupID: group.groupID, body: "새로운 그룹을 생성하였습니다." });

        // 1 대 1 채팅일 때 상대방 추가 및 관리자 권한 부여
        if (member.length === 1) {
            await this.groupMappingEntity.save({
                groupID: group.groupID,
                userID: member[0],
                isManager: true
            });
        } else {
            member.map(async (x, idx) => {
                await this.groupMappingEntity.save({
                    groupID: group.groupID,
                    userID: member[idx],
                    isManager: false
                });
            });
        }
    }

    async getChatList(accesstoken: string): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);
        const arr: number[] = [];

        /**
         * SELECT MAX(chat.chatID) AS chatID 
         * FROM Chatting AS chat, `Group` as `group`
         * WHERE group.groupID = chat.groupID
         * GROUP BY group.groupID
         * 
         * => 그룹별로 가장 최신의 채팅 아이디를 가져옴
         *  */ 
        const thisQuery = await this.groupEntity
            .createQueryBuilder('qb')
            .select('MAX(chat.chatID) AS chatID')
            .from(Chatting, 'chat')
            .addFrom(Group, 'group')
            .where('group.groupID = chat.groupID')
            .groupBy('group.groupID')
            .getRawMany();
        
        // arr에 thisQuery에서 가져온 chatID를 넣음
        thisQuery.map(e => {
            arr.push(e.chatID)
        })

        /**
         * SELECT qb.groupID AS groupID, 
         *        qb.name AS name,
         *        qb.profile AS profile,
         *        chat.body AS body,
         *        chat.isAnnounce AS isAnnounce,
         *        map.userID AS userID,
         *        chat.chatID AS chatID
         * FROM `Group` AS qb
         * INNER JOIN GroupMapping AS map ON GroupMapping.groupID = qb.groupID
         * INNER JOIN Chatting AS chat ON Chatting.groupID = qb.groupID
         * WHERE chat.chatID IN ${arr}
         * AND WHERE map.userID = ${userID}
         * 
         * => chatting과 group_mapping DB를 groupID가 일치하는 행만 이너 조인, chatID가 arr에 있고 userID가 일치하는 행만 조회
         */
        const thisList = await this.groupEntity
            .createQueryBuilder('qb')
            .innerJoin(Chatting, 'chat', 'chat.groupID = qb.groupID')
            .innerJoin(
                GroupMapping,
                'map',
                'map.groupID = qb.groupID',
            )
            .select([
                'qb.groupID as groupID',
                'qb.name as name',
                'qb.profile AS profile',
                'chat.body AS body',
                'chat.isAnnounce AS isAnnounce',
                'chat.userID AS userID',
                'chat.chatID AS chatID',
            ])
            .where('chat.chatID IN (:...arr)', { arr })
            .andWhere('map.userID = :userID', { userID })
            .getRawMany()
    
        return thisList;
    }

    async inviteMember(accesstoken: string, inviteMemberDto: InviteMemberDto) {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 파라미터 분리
        const { groupID, newUser } = inviteMemberDto;

        // 채팅방 존재 여부 확인
        const findGroup = await this.groupMappingEntity.findOneBy({
            groupID,
            userID,
        });
        if (!findGroup) throw new NotFoundException();

        for (let i = 0; i < newUser.length; i++) {
            // 초대 멤버 존재 여부 확인
            const findUser = await this.userEntity.findOneBy({ userID: newUser[i] });
            if (!findUser) throw new NotFoundException();

            // 초대 멤버 채팅방 존재 여부 확인
            const existUser = await this.groupMappingEntity.findOneBy({
                groupID: findGroup.groupID,
                userID: findUser.userID,
            });
            if (existUser) throw new ConflictException('이미 채팅방에 존재하는 멤버');

            await this.groupMappingEntity.save({
                groupID: findGroup.groupID,
                userID: findUser.userID,
                isManager: false,
            });
        }

        return await this.groupMappingEntity.find({
            where: { groupID: findGroup.groupID },
            select: ['groupID', 'userID', 'isManager'],
        });
    }

    async goneGroup(accesstoken: string, groupID: number) {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 채팅방 존재 & 참여 여부 확인
        const thisGroup = await this.groupMappingEntity.findOneBy({
            userID,
            groupID,
        });
        if (!thisGroup)
            throw new NotFoundException('참여하고 있지 않거나 존재하지 않는 채팅방');

        // 해당 유저가 나가면 채팅방에 남은 멤버가 1명일 때
        const count = await this.groupMappingEntity.countBy({ groupID });
        if (count === 2) {
            // 채팅방 삭제
            await this.groupMappingEntity.delete({ groupID });
            return await this.groupEntity.delete({ groupID });
        }

        // 관리자일 때
        if (thisGroup.isManager) {
            // 해당 유저가 나가면 관리자가 없을 때 (채팅방에 남은 멤버가 3명 이상일 때 = 단체 채팅방일 때)
            const countManager = await this.groupMappingEntity.countBy({
                groupID,
                isManager: true,
            });
            if (countManager === 1)
                throw new ConflictException('새로운 관리자를 추가해야 나갈 수 있음.');
        }

        // 채팅방에서 멤버 삭제
        return await this.groupMappingEntity.delete({
            userID,
            groupID,
        });
    }

    async getOutMember(accesstoken: string, groupID: number, memberID: number) {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 존재 & 권한 여부
        const thisGroup = await this.groupMappingEntity.findOneBy({
            groupID,
            userID,
        });
        const thisUser = await this.groupMappingEntity.findOneBy({
            groupID,
            userID: memberID,
        });
        if (!thisGroup || !thisUser)
            throw new NotFoundException('존재 & 참여하지 않음');
        if (!thisGroup.isManager) throw new ForbiddenException('권한 없음');

        //채팅인원 수가 2명일 때도 포함
        if (thisUser.isManager)
            throw new ConflictException('관리자를 강제퇴장시킬 수 없음');

        return await this.groupMappingEntity.delete({ groupID, userID: memberID });
    }

    async getGroupInfo(accesstoken: string, groupID: number) {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 그룹 존재 여부 확인
        const thisGroup = await this.groupEntity.findOneBy({ groupID });
        if (!thisGroup) throw new NotFoundException();

        // 그룹 소속 여부 확인
        const thisGroupMapping = await this.groupMappingEntity.findOneBy({
            groupID,
            userID,
        });
        if (!thisGroupMapping) throw new ForbiddenException();

        // 채팅방에 속한 유저 정보와 관리자 확인
        const count = await this.groupMappingEntity
            .createQueryBuilder('qb')
            .innerJoin('qb.user', 'user')
            .select(['qb.isManager', 'identify', 'name', 'profile'])
            .where('qb.groupID = :groupID', { groupID })
            .orderBy('isManager', 'DESC')
            .getRawMany();

        return {
            thisGroup,
            member: count,
        };
    }

    async updateGroupInfo(accesstoken: string, groupDto: UpdateGroupInfoDto) {
        const { userID } = await this.userService.validateAccess(accesstoken);
        const { groupID } = groupDto;

        const thisGroup = await this.groupEntity.findOneBy({ groupID });
        if (!thisGroup) throw new NotFoundException();

        const thisGroupMapping = await this.groupMappingEntity.findOneBy({
            userID,
            groupID,
        });
        if (!thisGroupMapping || !thisGroupMapping.isManager)
            throw new ForbiddenException();

        const name = groupDto.groupName ? groupDto.groupName : thisGroup.name;
        const profile = groupDto.groupProfile
            ? groupDto.groupProfile
            : thisGroup.profile;

        await this.groupEntity.update(
            {
                groupID,
            },
            {
                name,
                profile,
            },
        );

        return await this.groupEntity.findOneBy({ groupID });
    }

    async newGroupManager(
        accesstoken: string,
        groupID: number,
        newManagerID: number,
    ) {
        const { userID } = await this.userService.validateAccess(accesstoken);

        const thisUser = await this.groupMappingEntity.findOneBy({
            userID,
            groupID,
        });
        const newManager = await this.groupMappingEntity.findOneBy({
            userID: newManagerID,
            groupID,
        });

        if (!thisUser || !newManager) throw new NotFoundException();
        if (!thisUser.isManager) throw new ForbiddenException();
        if (newManager.isManager) throw new ConflictException();

        await this.groupMappingEntity.update(newManager, {
            isManager: true,
        });

        return await this.userEntity.findOne({
            where: { userID: newManagerID },
            select: ['name', 'identify', 'profile'],
        });
    }

    async dismissManager(
        accesstoken: string,
        groupID: number,
        managerID: number,
    ): Promise<object> {
        // JWT 유효성 검사 & userID 추출
        const { userID } = await this.userService.validateAccess(accesstoken);

        // 채팅방 존재 & 참여 여부 확인, 권한 확인
        const thisGroup = await this.groupMappingEntity.findOneBy({
            groupID,
            userID,
        });
        const thisUser = await this.groupMappingEntity.findOneBy({
            groupID,
            userID: managerID,
        });
        if (!thisGroup || !thisUser) throw new NotFoundException();
        if (!thisGroup.isManager)
            throw new ForbiddenException('관리자 해제 권한 없음');
        if (!thisUser.isManager) throw new ConflictException('이미 관리자가 아님');

        const countManager = await this.groupMappingEntity.countBy({
            groupID,
            isManager: true,
        });
        const countMember = await this.groupMappingEntity.countBy({ groupID });

        // 개인 채팅방일 때
        if (countMember === 2 && countManager === 2)
            throw new ConflictException('개인 채팅방일 때는 관리자 해제시킬 수 없음');

        // 본인의 관리자 권한을 해제할 수 있지만 채팅방엔 한 명 이상의 관리자 필요
        if (countManager === 1)
            throw new ConflictException('채팅방엔 한 명 이상의 관리자 필요');

        return await this.groupMappingEntity.update(thisUser, {
            isManager: false,
        });
    }

    async setChatToNotice(accesstoken: string, chatID: number): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);

        const thisChat = await this.chattingEntity.findOneBy({ chatID });
        if (!thisChat) throw new NotFoundException();

        const thisGroup = await this.groupMappingEntity.findOneBy({
            groupID: thisChat.groupID,
            userID,
        });
        if (!thisGroup) throw new ForbiddenException();

        if (thisChat.isNotice) throw new ConflictException();

        await this.chattingEntity.update(
            {
                groupID: thisChat.groupID,
                isNotice: true,
            },
            {
                isNotice: false,
            }
        );

        await this.chattingEntity.update(
            {
                chatID,
            },
            {
                isNotice: true,
            },
        );

        return await this.chattingEntity.findOneBy({ chatID });
    }
    
    async choosePrRepo(accesstoken: string, username: string): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);
        
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const option = {
            username,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }

        const repo = await octokit.request(`GET /users/{username}/repos`, option);

        const thisArr = [];
        
        repo.data.map( x => {
            thisArr.push({
                id: x.id,
                name: x.name,
                full_name: x.full_name,
                user_login: x.owner.login
            })
        })

        return thisArr;
    }
    
    async createAnnounce(accesstoken: string, repo: RepoDto): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);
        const github = await this.userEntity.findOneBy({ name: 'github' });

        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

        const thisReq = await octokit.request('POST /repos/{owner}/{repo}/hooks', {
            owner: repo.owner,
            repo: repo.name,
            name: 'web',
            active: true,
            events: [
                'push',
                'pull_request',
                'pull_request_review',
                'pull_request_review_comment',
                'pull_request_review_thread',
            ],
            config: {
                url: `http://dmg-api.soyeon.org/chat/github/${repo.owner}/${repo.name}/${userID}`,
                content_type: 'json',
                insecure_ssl: '0'
            },
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })

        const thisGroupID = await this.groupMappingEntity.find({
            where: [{
                userID,
                isManager: true,
            }, {
                userID: github.userID,
                isManager: true
                }],
            select: ['groupID']
        })

        if (!thisGroupID.filter((groupID) => thisGroupID.some((group) => group.groupID === groupID.groupID))) {
            const group = await this.groupEntity.save({
                name: 'github',
            })

            await this.groupMappingEntity.save({
                groupID: group.groupID,
                userID,
                isManager: true,
            });

            await this.groupMappingEntity.save({
                groupID: group.groupID,
                userID: github.userID,
                isManager: true,
            });
        }

        return thisReq;
    }

    async githubPR(owner: string, repo: string, userID: number): Promise<object> {
        console.log("githubPR")
        const prBotAccount = await this.userEntity.findOneBy({ identify: 'github' });
        const thisUser = await this.userEntity.findOneBy({ userID });

        const userGroup = await this.groupMappingEntity.find({
            where: {
                userID,
                isManager: true
            },
            select: ['groupID']
        })
        const list = []
        for (let a = 0; a <= userGroup.length; a++) {
            list.push(userGroup[a].groupID)
        }

        const githubGroup = await this.groupMappingEntity.findOne({
            where: {
                groupID: In([list])
            }
        })

        if (!githubGroup) {
            await this.groupEntity.save({
                name: `${thisUser.name}, github`
            })

            const thisGroup = await this.groupEntity.findOneBy({ name: `${thisUser.name}, github` });

            await this.groupMappingEntity.save({
                userID,
                groupID: thisGroup.groupID,
                isManager: true,
            })

            await this.groupMappingEntity.save({
                userID: prBotAccount.userID,
                groupID: thisGroup.groupID,
                isManager: true
            })
        }

        const userDto: userPayloadDto = {
            userID: prBotAccount.userID,
            identify: 'github'
        }
        const messageDto: CreateMessageDto = {
            groupID: githubGroup.groupID,
            body: `${repo} 레포지토리에 업데이트가 있습니다 : https://github.com/${owner}/${repo}/pulls`
        }

        const accesstoken = await this.userService.generateAccess(userDto);

        await this.createMessage(accesstoken, messageDto);

        return messageDto;
    }
}