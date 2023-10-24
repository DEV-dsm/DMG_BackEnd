import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FindPWDto {
    @ApiProperty({
        "example": "asdf@dsm.hs.kr",
        "description": "유저의 이메일"
    })
    @IsString()
    email: string;

    @ApiProperty({
        "example": "newPassword",
        "description": "새 비밀번호"
    })
    @IsString()
    newPassword: string;
}