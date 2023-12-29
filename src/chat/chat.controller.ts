import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { ChatService } from './chat.service';
import { CreateGroupDto } from './dto/createGroup.dto';
import { CreateMessageDto } from './dto/createMessage.dto';
import { InviteMemberDto } from './dto/inviteMember.dto';
import { RepoDto } from './dto/repo.dto';
import { UpdateGroupInfoDto } from './dto/updateGroupInfo.dto';

@ApiTags('/chat')
@UseFilters(new HttpExceptionFilter())
@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
    ) {

    }

    @ApiOperation({ summary: "채팅 보내기 API", description: "텍스트형 채팅 발송 API" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiBody({ type: CreateMessageDto })
    @ApiCreatedResponse({
        status: 201,
        description: "채팅 발송 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 채팅 그룹"
    })
    @ApiConflictResponse({
        status: 409,
        description: "해당 그룹에 존재하지 않는 유저가 채팅 발송"
    })
    @Post()
    async createMessage(@Headers('authorization') accesstoken: string, @Body() createMessageDto: CreateMessageDto): Promise<object> {
        const data = await this.chatService.createMessage(accesstoken, createMessageDto);

        return {
            data,
            statusCode: 201,
            statusMsg: "OK"
        };
    }

    @ApiOperation({ summary: "새로운 채팅방 생성 API", description: "새로운 채팅방 생성" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiBody({ type: CreateGroupDto })
    @ApiCreatedResponse({
        status: 201,
        description: "새로운 채팅방 생성 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 사람을 초대함"
    })
    @ApiConflictResponse({
        status: 409,
        description: "자기 자신 또는 같은 사람이 여럿 포함됨"
    })
    @Post('newGroup')
    async createGroup(@Headers('authorization') accesstoken: string, @Body() createGroupDto: CreateGroupDto) {
        await this.chatService.createGroup(accesstoken, createGroupDto);

        return {
            statusCode: 201,
            statusMsg: "새로운 채팅방이 생성되었습니다."
        };
    }

    // @ApiOperation({ summary: "채팅방 제목 검색 API", description: "채팅방 제목 검색하기" })
    // @ApiHeader({ name: "authorization", required: true })
    // @ApiOkResponse({
    //     status: 200,
    //     description: "채팅방 제목 검색 성공"
    // })
    // @ApiUnauthorizedResponse({
    //     status: 401,
    //     description: "액세스 토큰 검증 실패"
    // })
    // @ApiNotFoundResponse({
    //     status: 404,
    //     description: "존재하지 않는 채팅방 제목"
    // })
    // @Get('search')
    // async searchGroupTitle(@Headers('authorization') accesstoken: string, @Query('searchWord') searchWord: string) {
    //     const data = await this.chatService.searchGroupTitle(accesstoken, searchWord);

    //     return {
    //         data,
    //         statusCode: 200,
    //         statusMsg: "채팅방 제목 검색 성공"
    //     };
    // }

    @ApiOperation({ summary: "채팅방 리스트 조회하기 API", description: "채팅방 리스트 조회하기" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiOkResponse({
        status: 200,
        description: "채팅방 리스트 조회 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "참여한 채팅방이 없음"
    })
    @Get('list')
    async getGroupList(@Headers('authorization') accesstoken: string): Promise<object> {
        const data = await this.chatService.getGroupList(accesstoken);

        return {
            data,
            statusCode: 200,
            statusMsg: "OK"
        };
    }

    @ApiOperation({ summary: "새로운 멤버 초대 API", description: "새로운 멤버 초대" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiBody({ type: InviteMemberDto })
    @ApiOkResponse({
        status: 200,
        description: "멤버 초대 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: ""
    })
    @ApiConflictResponse({
        status: 409,
        description: "이미 채팅방에 존재하는 멤버"
    })
    @Post('invite')
    async inviteMember(@Headers('authorization') accesstoken: string, @Body() inviteMemberDto: InviteMemberDto) {
        const data = await this.chatService.inviteMember(accesstoken, inviteMemberDto);

        return {
            data,
            statusCode: 200,
            statusMsg: "채팅방 초대 성공"
        };
    }

    @ApiOperation({ summary: "채팅방 나가기 API", description: "채팅방 나가기 / 한 채팅방에는 무조건 한 명 이상의 관리자가 존재해야함" })
    @ApiHeader({ name: "accesstoken", required: true })
    @ApiQuery({ name: "groupID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "채팅방 나가기 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "참여하고 있지 않거나 존재하지 않는 채팅방"
    })
    @ApiConflictResponse({
        status: 409,
        description: "한 채팅방에는 무조건 한 명 이상의 관리자가 있어야 합니다."
    })
    @Delete('gone?')
    async goneGroup(@Headers('authorization') accesstoken: string, @Query('groupID') groupID: number) {
        await this.chatService.goneGroup(accesstoken, groupID);

        return {
            statusCode: 200,
            statusMsg: "채팅방 나가기 완료"
        };
    }

    @ApiOperation({ summary: "채팅방 멤버 강제퇴장 API", description: "채팅방 멤버 강제퇴장" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiQuery({ name: "groupID", type: "number" })
    @ApiQuery({ name: "userID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "강제퇴장 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "권한 없음"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재 & 참여하지 않음"
    })
    @ApiConflictResponse({
        status: 409,
        description: "본인 또는 관리자를 강제퇴장시킬 수 없음"
    })
    @Delete('getOut?')
    async getOutMember(@Headers('authorization') accesstoken: string,
    @Query('groupID') groupID: number,
    @Query('userID') userID: number) {
        await this.chatService.getOutMember(accesstoken, groupID, userID);

        return {
            statusCode: 200,
            statusMsg: "강제퇴장 완료"
        };
    }

    @ApiOperation({ summary: "채팅방 정보 확인하기 API", description: "특정 채팅방의 정보를 확인" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiQuery({ name: "groupID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: ""
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "JWT 만료"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "미소속된 채팅방에 대한 접근"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 채팅방"
    })
    @Get('info?')
    async getGroupInfo(@Headers('authorization') accesstoken: string, @Query('groupID') groupID: number) {
        const data = await this.chatService.getGroupInfo(accesstoken, groupID);

        return {
            data,
            statusCode: 200,
            statusMsg: ""
        };
    }

    @ApiOperation({ summary: '채팅방 정보 수정 API', description: '채팅방의 제목, 프로필 사진 등을 변경' })
    @ApiHeader({ name: 'authorization', required: true })
    @ApiBody({ type: UpdateGroupInfoDto })
    @ApiOkResponse({
        status: 200,
        description: "채팅방 정보 수정 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "본인이 속하지 않았거나, 매니저가 아닌 채팅방의 정보 수정 시도"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 채팅방"
    })
    @ApiConflictResponse({
        status: 409,
        description: "입력 자료 부족"
    })
    @Patch('info')
    async updateGroupInfo(@Headers('authorization') accesstoken: string, @Body() updateGroupInfoDto: UpdateGroupInfoDto): Promise<object> {
        const data = await this.chatService.updateGroupInfo(accesstoken, updateGroupInfoDto);

        return {
            data,
            statusCode: 200,
            statusMsg: "정보 수정 완료"
        };
    }

    @ApiOperation({ summary: '새로운 관리자 지정 API', description: '기존 방의 멤버 중 새로운 관리자 지정' })
    @ApiHeader({ name: 'accesstoken', required: true })
    @ApiQuery({ name: 'groupID', type: "number" })
    @ApiQuery({ name: 'userID', type: "number" })
    @ApiOkResponse({
        status: 200,
        description: '관리자 지정 완료'
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: '관리자 지정 권한 없음'
    })
    @ApiNotFoundResponse({
        status: 404,
        description: '해당 그룹에 존재하지 않는 멤버'
    })
    @ApiConflictResponse({
        status: 409,
        description: '이미 관리자인 멤버'
    })
    @Patch('manage?')
    async newGroupManager(
        @Headers('authorization') accesstoken: string,
        @Query('groupID') groupID: number,
        @Query('userID') userID: number): Promise<object> {
        const data = await this.chatService.newGroupManager(accesstoken, groupID, userID);

        return {
            data,
            statusCode: 200,
            statusMsg: '관리자 지정 완료'
        };
    }
    
    @ApiOperation({ summary: "관리자 해제 API", description: "관리자 해제" })
    @ApiHeader({ name: "accesstoken", required: true })
    @ApiQuery({ name: "groupID", type: "number" })
    @ApiQuery({ name: "userID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "관리자 해제 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "관리자 해제 권한 없음"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "해당 그룹에 존재하지 않는 멤버"
    })
    @ApiConflictResponse({
        status: 409,
        description: "이미 관리자가 아님"
    })
    @ApiConflictResponse({
        status: 409,
        description: "개인 채팅방일 때는 관리자 해제시킬 수 없음"
    })
    @ApiConflictResponse({
        status: 409,
        description: "채팅방엔 한 명 이상의 관리자 필요"
    })
    @Patch('manage/dismiss?')
    async dismissManager(
        @Headers('authorization') accesstoken: string,
        @Query('groupID') groupID: number,
        @Query('userID') userID: number) {
        await this.chatService.dismissManager(accesstoken, groupID, userID);

        return {
            statusCode: 200,
            statusMsg: "관리자 해제 완료"
        };
    }
    
    @ApiOperation({ summary: "채팅 공지 API", description: "채팅을 공지로 올림 / 한 채팅 그룹의 공지는 최대 1개" })
    @ApiHeader({ name: 'authorization', required: true })
    @ApiQuery({ name: 'chatID', type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "공지 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "방에 존재하지 않는 인원의 접근"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 채팅"
    })
    @ApiConflictResponse({
        status: 409,
        description: "이미 채팅이 공지로 설정되어 있음"
    })
    @Patch('notice?')
    async setChatToNotice(@Headers('authorization') accesstoken: string, @Query('chatID') chatID: number): Promise<object> {
        const data = await this.chatService.setChatToNotice(accesstoken, chatID);

        return {
            data,
            statusCode: 200,
            statusMsg: "채팅 공지 완료"
        };
    }

    @ApiOperation({ summary: "특정 유저의 레포 목록 가져오기 API", description: "깃허브 아이디를 통해 해당 유저의 레포지토리 목록을 가져옴" })
    @ApiHeader({ name: 'authorization', required: true })
    @ApiBody({ type: 'string' })
    @ApiOkResponse({
        status: 200,
        description: ""
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @Get('github')
    async choosePrRepo(@Headers('authorization') accesstoken: string, @Body('userName') userName: string): Promise<object> {
        const data = await this.chatService.choosePrRepo(accesstoken, userName);

        return {
            data,
            statusCode: 200,
            statusMsg: "채팅 공지 완료"
        };
    }

    @ApiOperation({ summary: "PR 알림 만들기", description: "특정 레포지토리를 선택해 해당 레포의 PR 알림 봇을 만듬" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiBody({ type: RepoDto })
    @ApiCreatedResponse({
        status: 201,
        description: "웹훅 생성 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "Forbidden"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "Resources not found"
    })
    @ApiUnprocessableEntityResponse({
        status: 422,
        description: "Validation failed, or the endpoint has been spammed."
    })
    @Post('github')
    async createAnnounce(@Headers('authorization') accesstoken: string, @Body() repo: RepoDto): Promise<object> {
        const data = await this.chatService.createAnnounce(accesstoken, repo);

        return {
            data,
            statusCode: 201,
            statusMsg: "웹훅 생성 완료"
        };
    }

    @ApiOperation({ summary: "웹훅 이벤트 발생 시 처리 API", description: "웹훅 이벤트 발생 시 해당 이벤트에 대해 처리" })
    @ApiParam({ name: "repoID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "처리 성공"
    })
    @Post('github/:owner/:repo/:userID')
    async githubPR(@Param('owner') owner: string, @Param('repo') repo: string, @Param('userID') userID: number): Promise<object> {
        const data = await this.chatService.githubPR(owner, repo, userID);

        return {
            data,
            statusCode: 201,
            statusMsg: "처리 성공"
        };
    }

    @ApiOperation({ summary: "채팅 조회 API", description: "채팅방의 채팅 조회 API" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiParam({ name: "groupID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "메시지 조회 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "존재하지 않거나 자신이 없는 채팅방에 접근"
    })
    @Get(':groupID')
    async readMessage(@Headers('authorization') accesstoken: string, @Param('groupID') groupID: number): Promise<object> {
        const data = await this.chatService.readMessage(accesstoken, groupID);

        return {
            data,
            statusCode: 200,
            statusMsg: "메시지 조회 성공"
        };
    }
}