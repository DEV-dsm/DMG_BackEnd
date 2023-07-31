import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class StudentProfileDto {
    @ApiProperty({
        example: "",
        description: "커스텀 아이디",
    })
    @IsString()
    identify: string;

    @ApiProperty({
        example: "",
        description: "이름"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "",
        description: "이메일"
    })
    @IsString()
    email: string;

    @ApiProperty({
        example: "",
        description: "전공"
    })
    @IsString()
    major: string;

    @ApiProperty({
        example: "",
        description: "깃허브 아이디"
    })
    @IsString()
    github: string;

    @ApiProperty({
        example: 1234,
        description: "학번"
    })
    @IsString()
    number: string;

    @ApiProperty({
        example: "",
        description: "프로필사진 파일 경로"
    })
    @IsString()
    profile: string;

    @ApiProperty({
        example: "",
        description: "배경사진 파일 경로"
    })
    @IsString()
    background: string;
}