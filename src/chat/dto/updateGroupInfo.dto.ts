import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateGroupInfoDto {
    @ApiProperty({
        example: 1,
        description: "그룹 고유 아이디"
    })
    @IsNumber()
    groupID!: number;

    @ApiProperty({
        example: "DEV",
        description: "그룹 이름"
    })
    @IsString()
    @IsOptional()
    groupName?: string;

    @ApiProperty({
        example: "프로필 사진 링크",
        description: "그룹 프로필 사진"
    })
    @IsString()
    @IsOptional()
    groupProfile?: string;
}