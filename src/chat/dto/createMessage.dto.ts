import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateMessageDto {
    @IsNumber()
    @ApiProperty({
        example: 1,
        description: "채팅을 보내는 그룹의 아이디"
    })
    groupID: number;

    @IsString()
    @ApiProperty({
        example: "안녕하세요 DMG 개발팀입니다.",
        description: "채팅 내용"
    })
    body: string;


}