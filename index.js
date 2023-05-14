const express = require("express");
const cors = require("cors");
const User = require("./config/firebase");
const app = express();
app.use(express.json());
app.use(cors());
const cron = require("node-cron");
let shell = require("shelljs");
const https =require("https")
var download = require('video-downloader');
var Path = require('path');

 var AWS = require("aws-sdk")
 const fs = require('fs');

 const Listr = require('listr')
 const Axios = require('axios')
 const rekognition = require("./config/amazon");

// AWS.config.update({
//   accessKeyId: 'AKIAQGBNL5GKC7X27L6E',
//   secretAccessKey: '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',
//   region: 'us-east-1'
// });



app.get("/", async (req, res) => {
  const snapshot = await User.get();
  const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.status(200).json(list);
});

app.post("/create", async (req, res) => {
  const data = req.body;
  await User.add(req.body);
  res.send({ msg: "User Added" });
});

app.post("/update", async (req, res) => {
  const id = req.body.id;
  delete req.body.id;
  const data = req.body;
  await User.doc(id).update(data);
  res.send({ msg: "Updated" });
});

app.post("/delete", async (req, res) => {
  const id = req.body.id;
  await User.doc(id).delete();
  res.send({ msg: "Deleted" });
});
app.listen(4000, () => console.log("Up & RUnning *4000"));


cron.schedule("* * * * *", function () {
  console.log("Scheduler running ... ");
  if (shell.exec("node rekognition.js").code !== 0) {
    console.log("something went wrong");
  }
});

// var params = {
//   Image : {
//     S3Object: {
//         'Bucket': 'testingrekognition123',
//         'Name': 'test.png',
        
//     }
  
//  }
// }

// rekognition.detectModerationLabels(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else  { 
//           //return the response
//           console.log(data); 
         
//        }    // successful response
//  });


 

