  const  { stdout } = require('process');
  const  { rekognition, sqsClient, snsClient } = require('../config/amazon');


// Set bucket and video variables
const bucket = "testingrekognition123";
const videoName = "video_1.mp4";
const roleArn = "arn:aws:iam::012980054420:role/serviceRekognitionVideo"
var startJobId = ""
let statusVideo;
var ts = Date.now();
const snsTopicName = "AmazonRekognitionExample" + ts;
const snsTopicParams = {"Name": snsTopicName}
const sqsQueueName = "AmazonRekognitionQueue-" + ts;




// Set the parameters
const sqsParams = {
  QueueName: sqsQueueName, //SQS_QUEUE_URL
  Attributes: {
    DelaySeconds: "60", // Number of seconds delay.
    MessageRetentionPeriod: "86400", // Number of seconds delay.
  },
};

const createTopicandQueue = async () => {
  try {
    statusVideo=true;
   console.log("first")
   const topicArn= await new Promise ((resolve, reject) => {
    snsClient.createTopic(snsTopicParams).promise()
    .then((data) => {
      // console.log(data.TopicArn)
      console.log("Success", data)
      resolve(data.TopicArn); 
    }).catch(err => {
      console.log("error in createTopic")
      reject(`Failed to get SNS name: , ${err}`)
    });
  });


const Queue= await new Promise ((resolve, reject) => {
    sqsClient.createQueue(sqsParams).promise()
    .then((data) => {
      // console.log(data.TopicArn)
      console.log("Success", data)
      resolve(data); 
    }).catch(err => {
      console.log("error in createQueue")
      reject(`Failed to get SqS name: , ${err}`)
    });
  });

  
 const sqsQueueUrl= await new Promise ((resolve, reject) => {
    sqsClient.getQueueUrl({QueueName: sqsQueueName}).promise()
    .then((data) => {
      // console.log(data.TopicArn)
      console.log("queue url is: ", data.QueueUrl)
      resolve(data.QueueUrl); 
    }).catch(err => {
      console.log("error in getQueueUrl")
      reject(`Failed to get SqS url: , ${err}`)
    });
  });
   

 const queueArn = await new Promise ((resolve, reject) => {
    sqsClient.getQueueAttributes({QueueUrl: sqsQueueUrl, AttributeNames: ['QueueArn']}).promise()
    .then((data) => {
      console.log("queue atrreibute is: ", data.Attributes)
     console.log(data.Attributes.QueueArn)
      resolve(data.Attributes.QueueArn); 
    }).catch(err => {
      console.log("error in getQueueAttributes")
      reject(`Failed to get QueueAttributes: , ${err}`)
    });
  });
 


  const sub= await new Promise ((resolve, reject) => {
    snsClient.subscribe({TopicArn: topicArn, Protocol:'sqs', Endpoint: queueArn}).promise()
    .then((data) => {
      console.log("success subscribe: ", data)
      resolve(data); 
    }).catch(err => {
      console.log("error in subscribe")
      reject(`Failed to subscribe: , ${err}`)
    });
  });



     const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "MyPolicy",
          Effect: "Allow",
          Principal: {AWS: "*"},
          Action: "SQS:SendMessage",
          Resource: queueArn,
          Condition: {
            ArnEquals: {
              'aws:SourceArn': topicArn
            }
          }
        }
      ]
    };
   console.log("request contain policy")

   const subSet= await new Promise ((resolve, reject) => {
    sqsClient.setQueueAttributes({QueueUrl: sqsQueueUrl, Attributes: {Policy: JSON.stringify(policy)}}).promise()
    .then((data) => {
      console.log("success subscribe set: ", data)
      resolve(data); 
    }).catch(err => {
      console.log("error in subscribe set")
      reject(`Failed to subscribe set: , ${err}`)
    });
  });
  return [sqsQueueUrl, topicArn]

  } catch (err) {
    console.log("error in createTopicandQueue method")
    console.log("Error", err);
  }
}

const startModerationDetection = async (roleArn, snsTopicArn) => {
  try {

    const jobIdValue= await new Promise ((resolve, reject) => {
      rekognition.startContentModeration({Video:{S3Object:{Bucket:bucket, Name:videoName}}, 
        NotificationChannel:{RoleArn: roleArn, SNSTopicArn: snsTopicArn}}).promise()
      .then((data) => {
        startJobId = data.JobId
        console.log(`JobID: ${startJobId}`)
        resolve( startJobId); 
      }).catch(err => {
        statusVideo="video rekognition is not complete"
        console.log("error in startModerationDetection")
        reject(`Failed to get jobId: , ${err}`)
      });
    });
 return jobIdValue;

  } catch (err) {
    console.log("here in start moderation detection")
    console.log("Error", err);
  }
};


const getModerationDetectionResults = async(startJobId) => {
  console.log("Retrieving moderation Detection results")
  // Set max results, paginationToken and finished will be updated depending on response values
  var maxResults = 30
  var paginationToken = ''
  var finished = false

  while (finished == false){


    const response= await new Promise ((resolve, reject) => {
      rekognition.getContentModeration({JobId: startJobId, MaxResults: maxResults, 
        NextToken: paginationToken, SortBy:'TIMESTAMP'}).promise()
      .then((data) => {
        resolve( data); 
      }).catch(err => {
        console.log("error in getModerationDetection")
        reject(`Failed in getModerationDetection: , ${err}`)
      });
    });


      // Log metadata
      console.log(`Codec: ${response.VideoMetadata.Codec}`)
      console.log(`Duration: ${response.VideoMetadata.DurationMillis}`)
      console.log(`Format: ${response.VideoMetadata.Format}`)
      console.log(`Frame Rate: ${response.VideoMetadata.FrameRate}`)
      console.log()
      console.log(response)
      console.log(response.ModerationLabels)

      if(response.ModerationLabels.length == 0){
        finished = true
      }
      else {
      // For every detected label, log label, confidence, bounding box, and timestamp
      response.ModerationLabels.forEach(labelDetection => {

        statusVideo=false  
        console.log(`Timestamp: ${labelDetection.Timestamp/1000}`)

        console.log(labelDetection.ModerationLabel);
        console.log()
       
        if (String(response).includes("NextToken")){
          paginationToken = response.NextToken
  
        }else{
          finished = true
        }
     

      })


    }
  }
}

// Checks for status of job completion
const getSQSMessageSuccess = async(sqsQueueUrl, startJobId) => {
  try {
    // Set job found and success status to false initially
    var jobFound = false
    var succeeded = false
    var dotLine = 0
    // while not found, continue to poll for response
    while (jobFound == false){

      const sqsReceivedResponse= await new Promise ((resolve, reject) => {
        sqsClient.receiveMessage({QueueUrl:sqsQueueUrl, 
          MaxNumberOfMessages:'ALL', MaxNumberOfMessages:10}).promise()
        .then((data) => {
          console.log(`sqsReceivedResponse: ${data}`)
          resolve( data); 
        }).catch(err => {
          statusVideo="video rekognition is not complete"
          console.log("error in receiveMessage: "+ err)
          reject()
        });
      });


     
      if (sqsReceivedResponse){
        var responseString = JSON.stringify(sqsReceivedResponse)
        if (!responseString.includes('Body')){
          if (dotLine < 40) {
            console.log('.')
            dotLine = dotLine + 1
          }else {
            console.log('')
            dotLine = 0 
          };
          stdout.write('', () => {
            console.log('');
          });
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue
        }
      }

      // Once job found, log Job ID and return true if status is succeeded
      for (var message of sqsReceivedResponse.Messages){
        console.log("Retrieved messages:")
        var notification = JSON.parse(message.Body)
        var rekMessage = JSON.parse(notification.Message)
        var messageJobId = rekMessage.JobId
        if (String(rekMessage.JobId).includes(String(startJobId))){
          console.log('Matching job found:')
          console.log(rekMessage.JobId)
          jobFound = true
          console.log(rekMessage.Status)
          if (String(rekMessage.Status).includes(String("SUCCEEDED"))){
            succeeded = true
            console.log("Job processing succeeded.")

            const sqsDeleteMessage= await new Promise ((resolve, reject) => {
              sqsClient.deleteMessage({QueueUrl:sqsQueueUrl, ReceiptHandle:message.ReceiptHandle}).promise()
              .then((data) => {
                
              console.log(`deleteMessage`)
                resolve( data); 
              }).catch(err => {
                console.log("error in deleteMessage")
                reject(`Failed in deleteMessage: , ${err}`)
              });
            });

          }
        }else{
          console.log("Provided Job ID did not match returned ID.")
          const sqsDeleteMessage= await new Promise ((resolve, reject) => {
            sqsClient.deleteMessage({QueueUrl:sqsQueueUrl, ReceiptHandle:message.ReceiptHandle}).promise()
            .then((data) => {
              
            console.log(`deleteMessage`)
              resolve( data); 
            }).catch(err => {
              console.log("error in deleteMessage")
              reject(`Failed in deleteMessage: , ${err}`)
            });
          });        }
      }
    }
  return succeeded
  } catch(err) {
    console.log("Error", err);
  }
};

// Start label detection job, sent status notification, check for success status
// Retrieve results if status is "SUCEEDED", delete notification queue and topic
const runModerationDetectionAndGetResults = async () => {
  try {
    const sqsAndTopic = await createTopicandQueue();
    console.log("before start")
    const startModerationDetectionRes = await startModerationDetection(roleArn, sqsAndTopic[1]);
     const getSQSMessageStatus = await getSQSMessageSuccess(sqsAndTopic[0], startModerationDetectionRes)
     console.log(getSQSMessageStatus)
    if (getSQSMessageSuccess){
      console.log("Retrieving results:")
      const results = await getModerationDetectionResults(startModerationDetectionRes)
    }
  
    const deleteQueue = await new Promise ((resolve, reject) => {
      sqsClient.deleteQueue({QueueUrl: sqsAndTopic[0]}).promise()
      .then((data) => {
        
      console.log("Successfully queue deleted.")
        resolve( data); 
      }).catch(err => {
        console.log("error in deleteQueue")
        reject(`Failed in deleteQueue: , ${err}`)
      });
    });

    const deleteTopic = await new Promise ((resolve, reject) => {
      snsClient.deleteTopic({TopicArn: sqsAndTopic[1]}).promise()
      .then((data) => {
        
        console.log("Successfully topic deleted.")
        resolve( data); 
      }).catch(err => {
        console.log("error in deleteTopic")
        reject(`Failed in deleteTopic: , ${err}`)
      });
    });
    return statusVideo
  } catch (err) {
    console.log("Error", err);
  }
};

//runModerationDetectionAndGetResults();

module.exports = runModerationDetectionAndGetResults;






