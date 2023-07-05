import { ApiProperty } from "@nestjs/swagger";

export class userPayloadDto {
    @ApiProperty({
        example: 1,
        description: "userID PK on DB"
    })
    userID: number;

    @ApiProperty({
        example: "dbwjid",
        description: "userID use in login"
    })
    identify: string;
}