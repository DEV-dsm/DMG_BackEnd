import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateGroupPeopleDto {
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
        example: [1, 3],
        description: "멤버 유저 아이디"
    })
    @IsArray()
    people: number[];
}