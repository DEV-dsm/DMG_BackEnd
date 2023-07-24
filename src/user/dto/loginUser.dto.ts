import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ example: "dev", description: "커스텀 아이디" })
    @IsString()
    identify: string;

    @ApiProperty({ example: "dev1234!@#$", description: "비밀번호" })
    @IsString()
    password: string;
}