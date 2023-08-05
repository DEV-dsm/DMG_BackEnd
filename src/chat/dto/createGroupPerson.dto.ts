import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateGroupPersonDto {
    @ApiProperty({
        example: "[2-1] 2023 공지방",
        description: "채팅방 이름"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "",
        description: "채팅방 프로필 사진"
    })
    @IsString()
    profile: string;

    @ApiProperty({
        example: 1,
        description: "상대방 유저 아이디"
    })
    @IsNumber()
    person: number;
}