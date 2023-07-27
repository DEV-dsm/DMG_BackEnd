import { ConflictException, Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

// 메일 옵션 타입
interface EmailOptions {
    to: string;
    from: string;
    subject: string;
    html: string;
}

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class MailService {
    private transporter: Mail

    constructor(
        @InjectRedis() private readonly redis: Redis,
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
     * @param email
     * @returns number
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
        
        const number = String(generateRandom(1, 999999)).padStart(6, '0');
        
        // redis에 인증번호 저장
        await this.redis.set(email, number);

        // 메일 형식
        const mailOptions: EmailOptions = {
            to: email,
            from: process.env.USER_MAIL,
            subject: '[DMG] 이메일 인증 관련 메일입니다.',
            html: `인증번호 ${number}`
        }

        await this.transporter.sendMail(mailOptions);

        setTimeout(() => {
            this.redis.set(email, null)
        }, 1000 * 300)

        return number;
    }

    /**
     * 
     * @param email
     * @param code
     * @returns
     * 
     * 이메일 검증
     */
    async verifyEmail(email: string, code: string) {
        // 존재하는 이메일인지 확인
        const existEmail = await this.userEntity.findOneBy({ email });
        if (!existEmail) throw new NotFoundException('존재하지 않는 이메일');

        // 인증번호 맞는지 확인
        const getCode = await this.redis.get(email);
        if (code != getCode) throw new ConflictException('일치하지 않는 인증번호');

        return {
            email,
            getCode
        };
    }
}
