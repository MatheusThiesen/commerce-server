import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as multerS3 from 'multer-s3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const configService = new ConfigService();

const s3Config = new S3Client({
  forcePathStyle: false,
  endpoint: configService.get('AWS_S3_ENDPOINT'),
  region: configService.get('AWS_DEFAULT_REGION'),
  credentials: {
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
  },
});
//@ts-ignore
const multerConfig = {
  storage: multerS3({
    s3: s3Config,
    bucket: configService.get('AWS_BUCKET_NAME'),
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (_req, file, cb) => {
      const fileName =
        path.parse(file.originalname).name.replace(/\s/g, '') + '-' + uuidv4();

      const extension = path.parse(file.originalname).ext;
      cb(null, `app/${fileName}${extension}`);
    },
  }),
};

export default multerConfig;
