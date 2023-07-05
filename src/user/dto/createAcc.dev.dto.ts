import { ApiProperty } from "@nestjs/swagger";

export class createAccDevDto {
    @ApiProperty({ example: "dev", description: "로그인 시 사용하는 아이디"})
    identify: string;

    @ApiProperty({ example: "데브", description: "사용자 이름"})
    name: string;

    @ApiProperty({ example: "dev1234!@#$", description: "비밀번호"})
    password: string;

    @ApiProperty({ example: "dev@dsm.hs.kr", description: "이메일"})
    email: string;

    @ApiProperty({ example: true, description: "학생 여부"})
    isStudent: boolean;

    @ApiProperty({ example: "Image URL", description: "프로필 사진이 저장된 경로"})
    profile?: string;

    @ApiProperty({ example: "Image URL", description: "배경 사진이 저장된 경로"})
    background?: string;


    @ApiProperty({ example: "프론트엔드", description: "학생의 전공"})
    major?: string;

    @ApiProperty({ example: "dev-dsm", description: "학생의 깃허브 아이디"})
    github?: string;

    @ApiProperty({ example: 1234, description: "학생의 학번"})
    number?: number;


    @ApiProperty({ example: "2층 제3교무실", description: "교사의 교무실 위치"})
    location?: string;

    @ApiProperty({ example: "과학", description: "담당 과목"})
    subject?: string;

    @ApiProperty({ example: "****부 부장", description: "담당 직무"})
    duty?: string;
}