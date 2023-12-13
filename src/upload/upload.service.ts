import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class UploadService {
    s3 = new AWS.S3();

    async uploadFile(file: Express.Multer.File) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: String(file.originalname),
            Body: file.buffer,
            ACL: 'public-read'
        };

        try {
            const response = await this.s3.upload(params).promise();
            return response.Location;
        } catch(err) {
            throw new BadRequestException('파일 업로드 실패');
        }
    }
}
