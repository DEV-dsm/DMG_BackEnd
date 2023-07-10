import { ApiProperty } from "@nestjs/swagger";

export class QuestionDto {
    @ApiProperty({
        example: "문의 제목",
        description: "문의 내용이 요약된 제목"
    })
    title: string;

    @ApiProperty({
        example: "문의 내용",
        description: "오류 등이 발견되어 제보하고 싶거나, 업데이트가 필요하다는 등의 내용"
    })
    content: string;
}