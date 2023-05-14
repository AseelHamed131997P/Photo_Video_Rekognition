const fs = require('fs');
const s3bucket = require('../config/S3');
const mediaConverterAWS = require('./mediaConverter');

const BUCKET_NAME = 'testingrekognition123';

 function uploadToS3(stream) {

  return new Promise(function(resolve, reject) {
    s3bucket.createBucket( function(err,data) {
      var params = {
        Bucket: BUCKET_NAME,
        Key: "video.mp4",
        Body: stream,
       };
        s3bucket.upload(params, async function (err, data) {
        if (err) {
         console.log('error when uploading video to S3');
         console.log(err);
         reject(err)
        }
        console.log('success when uploading video to S3');
        console.log(data);
        const resultRes = await mediaConverterAWS();
        resolve(resultRes)

       });

    });
}
)

}


module.exports = uploadToS3;



