import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class StudentProfileDto {
    @ApiProperty({
        example: "",
        description: "커스텀 아이디",
    })
    @IsString()
    @IsOptional()
    identify: string;

    @ApiProperty({
        example: "",
        description: "이름"
    })
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({
        example: "",
        description: "이메일"
    })
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty({
        example: "",
        description: "전공"
    })
    @IsString()
    @IsOptional()
    major: string;

    @ApiProperty({
        example: "",
        description: "깃허브 아이디"
    })
    @IsString()
    @IsOptional()
    github: string;

    @ApiProperty({
        example: 1234,
        description: "학번"
    })
    @IsString()
    @IsOptional()
    number: string;

    @ApiProperty({
        example: "",
        description: "프로필사진 파일 경로"
    })
    @IsString()
    @IsOptional()
    profile: string;

    @ApiProperty({
        example: "",
        description: "배경사진 파일 경로"
    })
    @IsString()
    @IsOptional()
    background: string;
}