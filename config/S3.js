const AWS = require('aws-sdk');
const BUCKET_NAME = 'testingrekognition123';
const IAM_USER_KEY = 'AKIAQGBNL5GKC7X27L6E';
const IAM_USER_SECRET = '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';

let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
  });

module.exports = s3bucket;
