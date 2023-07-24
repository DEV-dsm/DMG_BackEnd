import { Body, Controller, Get, Headers, Param, Patch, UseFilters } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { StudentProfileDto } from 'src/user/dto/studentProfile.dto';
import { TeacherProfileDto } from 'src/user/dto/teacherProfile.dto';
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

    @ApiOperation({
        summary: "학생 프로필 수정하기 API",
        description: "학생 프로필 수정하기"
    })
    @ApiHeader({ name: 'accesstoken', required: true })
    @ApiBody({ type: StudentProfileDto })
    @ApiOkResponse({
        status: 200,
        description: "학생 프로필 수정 완료"
    })
    @ApiConflictResponse({
        status: 409,
        description: "학생 전용 API에 선생님이 요청을 보냄"
    })
    @ApiConflictResponse({
        status: 409,
        description: "아이디 / 이메일 중복"
    })
    @Patch('student')
    async updateStudentProfile(
        @Headers('authorization') accesstoken: string,
        @Body() StudentProfileDto: StudentProfileDto
    ): Promise<object> {
        const data = await this.profileService.patchStudentProfile(accesstoken, StudentProfileDto);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "프로필 수정에 성공했습니다."
        })
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

    @ApiOperation({ summary: "유저 리스트 조회 API", description: "학생 유저 리스트 조회" })
    @ApiHeader({ name: "accesstoken", required: true })
    @ApiOkResponse({
        status: 200,
        description: ""
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @Get('student')
    async getStudentProfileList(@Headers('authorization') accesstoken: string): Promise<object> {
        const data = await this.profileService.getStudentProfileList(accesstoken);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "리스트 조회에 성공했습니다."
        })
    }

    @ApiOperation({ summary: "교사 프로필 수정 API", description: "교사 프로필 수정" })
    @ApiHeader({ name: "accesstoken", required: true })
    @ApiBody({ type: TeacherProfileDto })
    @ApiOkResponse({
        status: 200,
        description: "교사 프로필 수정 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiConflictResponse({
        status: 409,
        description: "교사 전용 API에 학생이 요청을 보냄"
    })
    @ApiConflictResponse({
        status: 409,
        description: "아이디 / 이메일 중복"
    })
    @Patch('teacher')
    async updateTeacherProfile(
        @Headers('authorization') accesstoken: string,
        @Body() teacherProfile: TeacherProfileDto
        ): Promise<object> {
        const data = await this.profileService.patchTeacherProfile(accesstoken, teacherProfile);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "교사 개인 프로필 수정이 완료되었습니다."
        })
    }

    @ApiOperation({ summary: "교사 프로필 조회 API", description: "교사 프로필 조회" })
    @ApiHeader({ name: "accesstoken", required: true })
    @ApiParam({ name: "userID", type: "number" })
    @ApiOkResponse({
        status: 200,
        description: "교사 프로필 조회 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "찾을 수 없는 사용자 아이디"
    })
    @Get('teacher/:userID')
    async getTeacherProfile(@Headers('authorization') accesstoken: string, @Param('userID') userID: number): Promise<object> {
        const data = await this.profileService.getTeacherProfile(accesstoken, userID);

        return Object.assign({
            data,
            statusCode: 200,
            statusMsg: "교사 프로필 조회에 성공했습니다."
        });
    }
}