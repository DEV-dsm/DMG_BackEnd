import { Injectable, NotFoundException } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import { SendEmailDto } from 'src/user/dto/send-email.dto';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { where } from 'sequelize';

// 메일 옵션 타입
interface EmailOptions {
    to: string;
    from: string;
    subject: string;
    html: string;
}

@Injectable()
export class MailService {
    private transporter: Mail

    constructor(
        @InjectRepository(User) private userEntity: Repository<User>
    ) {
        // transporter 객체 생성
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.USER_PASS
            }
        });
    }

    /**
     * 
     * @param emailDto 
     * @returns number, send
     * 
     * 이메일 발송
     */
    async sendEmail(email: string) {
        const existEmail = await this.userEntity.findOneBy({ email });

        if (!existEmail) throw new NotFoundException('존재하지 않는 이메일');

        // 난수 생성 (인증번호 생성)
        const generateRandom = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        
        const number = generateRandom(111111, 999999);

        // 메일 형식
        const mailOptions: EmailOptions = {
            to: email,
            from: process.env.USER_MAIL,
            subject: '[DMG] 이메일 인증 관련 메일입니다.',
            html: `인증번호 ${number}`
        }

        await this.transporter.sendMail(mailOptions);

        return {
            number,
        }
    }
}
