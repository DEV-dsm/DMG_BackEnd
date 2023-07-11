import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class passwordDto {
    @ApiProperty({
        example: "qlalfqjsgh",
        description: "original password"
    })
    @IsString()
    password: string;

    @ApiProperty({
        example: "tofhdnsqlqjs",
        description: "new password"
    })
    @IsString()
    newPassword: string;
}