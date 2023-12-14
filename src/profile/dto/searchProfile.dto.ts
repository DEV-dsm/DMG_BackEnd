import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SearchProfileDto {
    @ApiProperty({
        example: "name or number",
        description: "학생, 교사 중 선택해서 검색"
    })
    @IsString()
    standard: string;

    @ApiProperty({
        example: "soyeon",
        description: "검색 키워드"
    })
    @IsString()
    keyword: string;
}