import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class RepoDto {
    @ApiProperty({
        example: "DMG_BackEnd",
        description: "레포지토리 이름"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "DEV-dsm",
        description: "레포지토리 소유자 이름"
    })
    @IsString()
    owner: string;
}