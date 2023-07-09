import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
    @ApiProperty({ example: "dev", description: "커스텀 아이디" })
    identify: string;

    @ApiProperty({ example: "dev1234!@#$", description: "비밀번호" })
    password: string;
}