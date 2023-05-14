var AWS = require("aws-sdk")
const REGION = "us-east-1"; //e.g. "us-east-1"

AWS.config.update({
    accessKeyId: 'AKIAQGBNL5GKC7X27L6E',
    secretAccessKey: 'WrTPAgZ7FwS6c+YGJO1f2Q4vl1//5Rph1Pb9wEOZ',
    region: REGION
  });

const rekognition = new AWS.Rekognition({ apiVersion: "latest", region: REGION });
  const sqsClient = new AWS.SQS({apiVersion: '2012-11-05', region: REGION});
  const snsClient = new AWS.SNS({apiVersion: '2012-11-05', region: REGION});
  const emcClientGet = new AWS.MediaConvert({ apiVersion: "latest",region: REGION})

module.exports = {rekognition, sqsClient, snsClient, emcClientGet};
