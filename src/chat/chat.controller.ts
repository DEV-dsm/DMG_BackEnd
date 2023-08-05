import { Body, Controller, Get, Headers, Post, Query, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { ChatService } from './chat.service';
import { CreateGroupPersonDto } from './dto/createGroupPerson.dto';
import { CreateMessageDto } from './dto/createMessage.dto';

@ApiTags('/chat')
@UseFilters(new HttpExceptionFilter())
@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
    ) {

    }

    @ApiOperation({ summary: "채팅 보내기 API", description: "텍스트형 채팅 발송 API" })
    @ApiHeader({ name: "accesstoken", required: true })
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

        return Object.assign({
            data,
            statusCode: 201,
            statusMsg: "OK"
        })
    }

    @ApiOperation({ summary: "개인 채팅방 만들기 API", description: "개인 채팅방 만들기" })
    @ApiHeader({ name: "authorization", required: true})
    @ApiCreatedResponse({
        status: 201,
        description: "개인 채팅방 생성 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @Post('newPerson')
    async createGroupPerson(@Headers('authorization') accesstoken: string, @Body() createGroupDto: CreateGroupPersonDto) {
        const data = await this.chatService.createGroupPerson(accesstoken, createGroupDto);

        return Object.assign({
            data,
            statusCode: 201,
            statusMsg: "개인 채팅방이 생성되었습니다."
        })
    }

    @ApiOperation({ summary: "채팅방 정보 확인하기 API", description: "특정 채팅방의 정보를 확인" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiParam({ name: "groupID", type: "number" })
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

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: ""
        })
    }
}