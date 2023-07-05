import { ApiProperty } from "@nestjs/swagger";

export class passwordDto {
    @ApiProperty({
        example: "qlalfqjsgh",
        description: "original password"
    })
    password: string;

    @ApiProperty({
        example: "tofhdnsqlqjs",
        description: "new password"
    })
    newPassword: string;
}