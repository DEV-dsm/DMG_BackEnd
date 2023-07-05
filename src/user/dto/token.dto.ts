import { ApiProperty } from "@nestjs/swagger";

export class tokenDto {
    @ApiProperty({
        example: "Bearer ...",
        description: "Bearer Token AccessToken"
    })
    accesstoken: string;

    @ApiProperty({
        example: "Bearer ...",
        description: "Bearer Token RefreshToken"
    })
    refreshtoken: string;
}