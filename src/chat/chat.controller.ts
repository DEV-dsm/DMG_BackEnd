import { Body, Controller, Headers, Post, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiHeader, ApiNotFoundResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { ChatService } from './chat.service';
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
    async createChat(@Headers('authorization') accesstoken: string, @Body() createMessageDto: CreateMessageDto): Promise<object> {
        const data = await this.chatService.createMessage(accesstoken, createMessageDto);

        return Object.assign({
            data,
            statusCode: 201,
            statusMsg: "OK"
        })
    }
}