const express = require('express');
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const router = express.Router();

AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: 'ap-northeast-2',
});

// 이미지 저장경로, 파일명 세팅
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'imagesbucket1',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      console.log(file);
      cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: req.file.location });
});

module.exports = router;
