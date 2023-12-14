import { Body, Controller, Get, Headers, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { SearchProfileDto } from 'src/profile/dto/searchProfile.dto';
import { UpdateStudentProfileDto } from './dto/updateStudentProfile.dto';
import { UpdateTeacherProfileDto } from './dto/updateTeacherProfile.dto';
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
    @ApiHeader({ name: 'authorization', required: true })
    @ApiBody({ type: UpdateStudentProfileDto })
    @ApiOkResponse({
        status: 200,
        description: "학생 프로필 수정 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "학생 전용 API에 교사가 요청을 보냄"
    })
    @ApiConflictResponse({
        status: 409,
        description: "아이디 / 이메일 중복"
    })
    @Patch('student')
    async updateStudentProfile(
        @Headers('authorization') accesstoken: string,
        @Body() studentProfileDto: UpdateStudentProfileDto
    ): Promise<object> {
        await this.profileService.patchStudentProfile(accesstoken, studentProfileDto);

        return {
            statusCode: 200,
            statusMsg: "프로필 수정에 성공했습니다."
        };
    }

    @ApiOperation({ summary: "학생 프로필 조회 API", description: "학생 프로필 조회" })
    @ApiHeader({ name: "authorization", required: true })
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

        return {
            data,
            statusCode: 200,
            statusMsg: "학생 프로필 조회에 성공했습니다."
        };
    }

    @ApiOperation({ summary: "학생 리스트 조회 API", description: "학생 리스트 조회" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiOkResponse({
        status: 200,
        description: "학생 리스트 조회 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @Get('student')
    async getStudentProfileList(@Headers('authorization') accesstoken: string): Promise<object> {
        const data = await this.profileService.getStudentProfileList(accesstoken);

        return {
            data,
            statusCode: 200,
            statusMsg: "학생 리스트 조회에 성공했습니다."
        };
    }

    @ApiOperation({ summary: "교사 프로필 수정 API", description: "교사 프로필 수정" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiBody({ type: UpdateTeacherProfileDto })
    @ApiOkResponse({
        status: 200,
        description: "교사 프로필 수정 완료"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiForbiddenResponse({
        status: 403,
        description: "교사 전용 API에 학생이 요청을 보냄"
    })
    @ApiConflictResponse({
        status: 409,
        description: "아이디 / 이메일 중복"
    })
    @Patch('teacher')
    async updateTeacherProfile(
        @Headers('authorization') accesstoken: string,
        @Body() teacherProfile: UpdateTeacherProfileDto
        ): Promise<object> {
        await this.profileService.patchTeacherProfile(accesstoken, teacherProfile);

        return {
            statusCode: 200,
            statusMsg: "교사 개인 프로필 수정이 완료되었습니다."
        };
    }

    @ApiOperation({ summary: "교사 프로필 조회 API", description: "교사 프로필 조회" })
    @ApiHeader({ name: "authorization", required: true })
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

        return {
            data,
            statusCode: 200,
            statusMsg: "교사 프로필 조회에 성공했습니다."
        };
    }

    @ApiOperation({ summary: "교사 리스트 조회 API", description: "교사 리스트 조회" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiOkResponse({
        status: 200,
        description: "교사 리스트 조회 성공"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @Get('teacher')
    async getTeacherProfileList(@Headers('authorization') accesstoken: string): Promise<object> {
        const data = await this.profileService.getTeacherProfileList(accesstoken);

        return {
            data,
            statusCode: 200,
            statusMsg: "교사 리스트 조회에 성공했습니다."
        };
    }

    @ApiOperation({ summary: "유저 검색 API", description: "유저 검색" })
    @ApiHeader({ name: "authorization", required: true })
    @ApiParam({ name: "isStudent", type: "boolean" })
    @ApiOkResponse({
        status: 200,
        description: "유저 검색 성공"
    })
    @ApiBadRequestResponse({
        status: 400,
        description: "잘못된 요청"
    })
    @ApiUnauthorizedResponse({
        status: 401,
        description: "액세스 토큰 검증 실패"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "해당 유저를 찾을 수 없음"
    })
    @Post('search/:isStudent')
    async searchProfileList(
        @Headers('authorization') accesstoken: string,
        @Param('isStudent') isStudent: boolean,
        @Body() searchProfile: SearchProfileDto
        ): Promise<object> {
            const data = await this.profileService.searchProfileList(accesstoken, isStudent, searchProfile);

            return {
                data,
                statusCode: 200,
                statusMsg: "유저 검색에 성공했습니다."
            };
    }
}