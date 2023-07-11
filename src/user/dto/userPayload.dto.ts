import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class userPayloadDto {
    @ApiProperty({
        example: 1,
        description: "userID PK on DB"
    })
    @IsNumber()
    userID: number;

    @ApiProperty({
        example: "dbwjid",
        description: "userID use in login"
    })
    @IsString()
    identify: string;
}