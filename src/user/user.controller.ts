import { Body, Controller, Headers, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiHeader, ApiHeaders, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { createAccDevDto } from './dto/createAcc.dev.dto';
import { passwordDto } from './dto/password.dto';
import { tokenDto } from './dto/token.dto';
import { userPayloadDto } from './dto/userPayload.dto';
import { UserService } from './user.service';

@ApiTags('/user')
@UseFilters(new HttpExceptionFilter())
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
    ) {
        this.userService = userService;
    }    
    @ApiOperation({ summary: "회원가입", description: "회원가입 API" })
    @ApiBody({ type: createAccDevDto })
    @ApiCreatedResponse({
        status: 201,
        description: "계정 생성 완료"
    })
    @Post('createAcc')
    async createUserAcc(@Body() userAccDto: createAccDevDto) {
        const data = await this.userService.createAcc(userAccDto);

        return Object.assign({
            data,
            statusCode: 201,
            statusMsg: "계정 생성 완료"
        })
    }

    @ApiOperation({
        summary: "비밀번호 수정 (로그인한 상태)",
        description: "로그인이 되어있는 상태에서 하는 비밀번호 수정"
    })
    @ApiHeader({ name: "accessToken", required: true })
    @ApiBody({ type: passwordDto })
    @ApiOkResponse({
        status: 200,
        description: "비밀번호 성공적 수정"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "토큰이 유효하지 않은 경우"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "토큰 디코딩 시 존재하지 않는 유저인 경우"
    })
    @ApiConflictResponse({
        status: 409,
        description: "기존 비밀번호와 새 비밀번호가 일치하는 경우"
    })
    @ApiConflictResponse({
        status: 409,
        description: "기존 비밀번호가 계정의 비밀번호와 일치하지 않는 경우"
    })
    @ApiConflictResponse({
        status: 409,
        description: "비밀번호 규칙에 맞지 않는 경우"
    })
    @Patch('/password')
    async patchPW(@Headers('authorization') accesstoken: string, @Body() passwordDto: passwordDto): Promise<object> {
        const data = await this.userService.patchPW(accesstoken, passwordDto);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "비밀번호가 수정되었습니다."
        })
    }
}
