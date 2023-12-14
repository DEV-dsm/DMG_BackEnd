import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateTeacherProfileDto {
    
    @ApiProperty({
        example: "osj",
        description: "커스텀 아이디"
    })
    @IsString()
    @IsOptional()
    identify?: string;

    @ApiProperty({
        example: "오상진",
        description: "이름"
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: "osj@dsm.hs.kr",
        description: "이메일"
    })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: "asdfasdf",
        description: "프로필 사진 파일 경로"
    })
    @IsString()
    @IsOptional()
    profile?: string;

    @ApiProperty({
        example: "asdfasdf",
        description: "배경 사진 파일 경로"
    })
    @IsString()
    @IsOptional()
    background?: string;

    @ApiProperty({
        example: "2층 본부 교무실",
        description: "교무실 위치"
    })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({
        example: "과학",
        description: "담당 과목"
    })
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiProperty({
        example: "마이스터 부장",
        description: "담당 직무"
    })
    @IsString()
    @IsOptional()
    duty?: string;

}