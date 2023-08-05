import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class InviteMemberDto {

    @ApiProperty({
        example: 1,
        description: "채팅을 보내는 그룹의 아이디"
    })
    @IsNumber()
    groupID: number;

    @ApiProperty({
        example: [1, 3],
        description: "새로 추가할 멤버 유저 아이디"
    })
    @IsArray()
    newUser: number[];
}