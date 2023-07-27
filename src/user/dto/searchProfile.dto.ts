import { IsString } from "class-validator";

export class searchProfileDto {
    @IsString()
    standard: string;

    @IsString()
    keyword: string;
}

// api property 적용