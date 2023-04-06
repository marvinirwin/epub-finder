import {Controller, Get, NotFoundException, Param, Res} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Readable } from 'stream';

@Controller('video')
export class VideoController {
    private readonly s3 = new S3({
        region: process.env.DOCUMENT_S3_REGION,
        accessKeyId: process.env.DOCUMENT_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.DOCUMENT_S3_ACCESS_KEY_SECRET,
    });

    @Get(':key')
    async streamVideo(@Param('key') key: string, @Res() res): Promise<void> {
        const s3Object = await this.s3.getObject({
            Bucket: process.env.DOCUMENT_S3_BUCKET,
            Key: key,
        }).promise();

        if (!s3Object.Body) {
            throw new NotFoundException('Video not found');
        }

        const stream = new Readable();
        stream._read = () => {}; // override the method to implement it later

        const chunkSize = 10 ** 6; // 1MB
        let offset = 0;

        stream._read = () => {
            const chunk = s3Object.Body.slice(offset, offset + chunkSize);
            offset += chunkSize;

            if (chunk.length === 0) {
                stream.push(null);
            } else {
                stream.push(chunk);
            }
        };

        res.setHeader('Content-Type', s3Object.ContentType);
        res.setHeader('Content-Length', s3Object.ContentLength);
        stream.pipe(res);
    }
}
