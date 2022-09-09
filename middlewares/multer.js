const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');
require('dotenv').config();
const path = require('path');
const ErrorCustom = require('../advice/errorCustom');
// aws.config.loadFromPath(__dirname + '/../config/s3.json');

// 이미지 파일 확장자명
const allowedExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.bmp',
  '.gif',
  '.raw',
  '.tif',
  '.tiff',
];

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // 이미지 파일 형식인지 확인
      const extension = path.extname(file.originalname).toLocaleLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return cb(new ErrorCustom(400, '이미지 파일 형식이 아닙니다.'));
      }
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 1024 * 1024 }, // 1MB 크기제한
});
module.exports = upload;
