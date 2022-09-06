const aws = require('aws-sdk');
require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.S3_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION,
});
module.exports = s3;
