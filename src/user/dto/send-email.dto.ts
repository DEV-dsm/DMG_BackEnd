import { ApiProperty } from "@nestjs/swagger";

export class SendEmailDto {
    @ApiProperty({
        example: "soyeonkim0227@dsm.hs.kr",
        description: "인증 메일을 보낼 이메일"
    })
    email: string;
}