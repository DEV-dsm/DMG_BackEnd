import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class RepoDto {
    @ApiProperty({
        example: "",
        description: ""
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "",
        description: ""
    })
    @IsString()
    owner: string;
}