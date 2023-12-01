import { Body, Controller, Get, Headers, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { MailService } from 'src/mail/mail.service';
import { createAccDevDto } from './dto/createAcc.dev.dto';
import { FindPWDto } from './dto/findPW.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { passwordDto } from './dto/password.dto';
import { QuestionDto } from './dto/question.dto';
import { UserService } from './user.service';

@ApiTags('/user')
@UseFilters(new HttpExceptionFilter())
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private mailService: MailService,
    ) {
        this.userService = userService;
    }    

    @ApiOperation({ summary: "회원가입", description: "회원가입 API" })
    @ApiBody({ type: createAccDevDto })
    @ApiCreatedResponse({
        status: 201,
        description: "계정 생성 완료"
    })
    @ApiConflictResponse({
        status: 409,
        description: "아이디 / 이메일 중복"
    })
    @Post('createAcc')
    async createUserAcc(@Body() userAccDto: createAccDevDto) {
        await this.userService.createAcc(userAccDto);

        return Object.assign({
            statusCode: 201,
            statusMsg: "계정 생성 완료됐다 test"
        })
    }

    @ApiOperation({ summary: "로그인", description: "로그인 API" })
    @ApiBody({ type: LoginUserDto })
    @ApiOkResponse({
        status: 200,
        description: "로그인 완료"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 유저"
    })
    @ApiConflictResponse({
        status: 409,
        description: "비밀번호 불일치"
    })
    @Post('login')
    async login(@Body() loginDto: LoginUserDto) {
        const data = await this.userService.login(loginDto);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "로그인이 완료되었습니다. 오예 하나 해결띠"
        })
    }

    @ApiOperation({ summary: "이메일 인증코드 발송 API", description: "이메일로 인증코드 발송" })
    @ApiBody({ type: 'string' })
    @ApiOkResponse({
        status: 200,
        description: "해당 이메일로 인증번호 발송 완료"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 이메일"
    })
    @Post('email')
    async sendEmail(@Body('email') email: string) {
        const data = await this.mailService.sendEmail(email);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "인증번호 이메일 발송이 완료되었습니다."
        })
    }

    @ApiOperation({ summary: "인증코드 검증 API", description: "인증코드 검증" })
    @ApiParam({ name: "email", type: "string" })
    @ApiBody({ type: "string" })
    @ApiOkResponse({
        status: 200,
        description: "올바른 인증번호"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "존재하지 않는 이메일"
    })
    @ApiConflictResponse({
        status: 409,
        description: "일치하지 않는 인증번호"
    })
    @Post('verify/:email')
    async verifyEmail(@Param('email') email: string, @Body('code') code: string) {
        const data = await this.mailService.verifyEmail(email, code);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "올바른 인증번호입니다."
        })
    }

    @ApiOperation({
        summary: "비밀번호 수정 (로그인한 상태)",
        description: "로그인이 되어있는 상태에서 하는 비밀번호 수정"
    })
    @ApiHeader({ name: "authorization", required: true })
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

    @ApiOperation({
        summary: "비밀번호 찾기 API",
        description: "비로그인 상태에서 비밀번호를 알 수 없게 된 경우"
    })
    @ApiBody({ type: 'number' })
    @ApiBody({ type: 'string' })
    @ApiOkResponse({
        status: 200,
        description: "비밀번호 성공적 수정"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "찾을 수 없는 유저"
    })
    @ApiConflictResponse({
        status: 409,
        description: "비밀번호 규칙 미반영"
    })
    @Patch('findPW')
    async findPW(@Body() findPWDto: FindPWDto): Promise<object> {
        const data = await this.userService.findPW(findPWDto);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "비밀번호가 수정되었습니다."
        })
    }
        
    @ApiOperation({
        summary: "문의 API",
        description: "불만 사항 / 업데이트 건의 / 오류 등 발생 시 문의할 수 있음"
    })
    @ApiHeader({ name: "authorization", required: true })
    @ApiBody({
        type: QuestionDto,
    })
    @ApiCreatedResponse({
        status: 201,
        description: "문의 완료"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "찾을 수 없는 사용자"
    })
    @Post('question')
    async question(@Headers('authorization') accesstoken: string, @Body() questionDto: QuestionDto): Promise<object>{
        const data = await this.userService.question(accesstoken, questionDto);

        return Object.assign({
            data,
            statusCode: 201,
            statusMsg: "문의가 완료되었습니다."
        })
    }

    @ApiOperation({
        summary: "리프레시 토큰 검증",
        description: "액세스토큰이 만료된 경우 리프레시 토큰으로 요청 보내 재발급"
    })
    @ApiHeader({ name: 'authorization', required: true })
    @ApiOkResponse({
        status: 200,
        description: "리프레시 토큰으로 액세스 토큰 재발급"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "리프레시 토큰 만료됨"
    })
    @Get('token')
    async validateRefresh(@Headers('authorization') refreshToken: string): Promise<object>{ 
        const data = await this.userService.validateRefresh(refreshToken);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "토큰 재발급이 완료되었습니ㅏㄷ."
        })
    }
}
