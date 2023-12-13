import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsOptional, IsString } from "class-validator"

export class CreateGroupDto {
    @ApiProperty({
        example: "[2023] 2-1 공지방",
        description: "채팅방 이름"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "asdf",
        description: "채팅방 프로필 사진"
    })
    @IsOptional()
    @IsString()
    profile?: string;

    @ApiProperty({
        example: "[1, 2] or [1]",
        description: "자신 제외 멤버 유저 아이디"
    })
    @IsArray()
    member: number[]
}