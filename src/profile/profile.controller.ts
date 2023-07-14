import { Controller, Get, Headers, Param, UseFilters } from '@nestjs/common';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { ProfileService } from './profile.service';

@ApiTags('프로필 API')
@UseFilters(new HttpExceptionFilter())
@Controller('profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService,
    ) {
        this.profileService = profileService;
    }

    @ApiOperation({ summary: "학생 프로필 조회 API", description: "학생 프로필 조회" })
    @ApiHeader({ name: "accesstoken", required: true })
    @ApiParam({ name: "userID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "학생 프로필 조회 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "찾을 수 없는 사용자 아이디"
    })
    @Get('student/:userID')
    async getStudentProfile(@Headers('authorization') accesstoken: string, @Param('userID') userID: number): Promise<object> {
        const data = await this.profileService.getStudentProfile(accesstoken, userID);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "학생 프로필 조회에 성공했습니다."
        })
    }
}