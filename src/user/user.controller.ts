import { Body, Controller, Headers, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiHeader, ApiHeaders, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { createAccDevDto } from './dto/createAcc.dev.dto';
import { passwordDto } from './dto/password.dto';
import { tokenDto } from './dto/token.dto';
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
}
