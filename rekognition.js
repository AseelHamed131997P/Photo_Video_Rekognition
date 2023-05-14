// const axios = require("axios");
const User = require("./config/firebase");
const {rekognition} = require("./config/amazon");
const fs = require('fs');
const imageDownloader = require('image-downloader')
const downloadVideo= require("./actions/videoDownloader")


let index;
let arrayImages;
let len;
let indexList;
let lenList;
let list;
let rejectedImages=[];
let acceptedImages=[];
let videosStatus=[]



async function getData(){
      User.where('Status', '==', 0).get()
     .then(snapshot=>{
      list= snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
      console.log(list)
      console.log("secoooooooooooooooooond")
      lenList=list.length;
      indexList=0;
     getImages(list[indexList])
     })
     .catch(err=>{
      console.log("error when get docs")
      console.log("error:"+ err)
     })
      

  }
getData()  

 function getImages(list){
  console.log("here in process fun")
  console.log("here images")
 
  console.log("here list of images")
  arrayImages =list.Images
  len=arrayImages.length;
  console.log(len)
  index=0;

  getResponseRekognitionForImage(arrayImages[index])

}







function getResponseRekognitionForImage(image){
  console.log("here in response fun")
const options = {
  url:
    `${image}`,
     dest: "./photo.jpg",
  // will be saved to /path/to/dest/image.jpg
};

imageDownloader
  .image(options)
  .then(({ filename }) => {
    console.log("file saved" + filename);
    const file = "./node_modules/image-downloader/photo.jpg"
    //const file = '.\node_modules\image-downloader\photo.jpg';
    const bitmap = fs.readFileSync(file);
    const buffer = new Buffer.from(bitmap, 'base64')

var params = {
  Image: {
   "Bytes":buffer
  }
 };
//  const rekognition = new AWS.Rekognition();

  rekognition.detectModerationLabels(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else  { 
          //return the response
          console.log(data); 
          //filter the images accept or reject
           if(data.ModerationLabels.length == 0){
              acceptedImages.push(image)
           }else{
              rejectedImages.push(image)
           }
         

           // for next image
           index++
           //examine if images in this document finished if finished
           // will go to next document else go to next image 
           if(index == len){
            acceptedImages.length > 0 ? console.log(acceptedImages): console.log("accepted images array is empty")
            rejectedImages.length >0 ?console.log(rejectedImages): console.log("rejected images array is empty")
           // examine case of activity
             rejectedImages.length == len ? (
               rejectActivity() 
            ):acceptedImages.length == len ?
               
               (acceptActivity())
             : (updateActivity())

              
              

          
           }else{
            getResponseRekognitionForImage(arrayImages[index])
           }
          //  return data 
       }    // successful response
 });
  

try {
  fs.unlinkSync(file)
  console.log("file removed")
  //file removed
} catch(err) {
  console.error(err)
}

  })
  .catch((err) => console.error(err));
   
}




function rejectActivity(){
  User.doc(list[indexList].docId).delete()
  .then(res =>{
    console.log("deleted activity successfuly")
    nextList()
  })
  .catch(error =>{
    console.log("error:"+ error)
  })
}




async function updateActivity(){
  videosStatus=[]
  list[indexList].Images=acceptedImages
  const res= await videoAnalysis(list[indexList].Video, list[indexList].Video2)
if(res){
  updateFirebase("your activity was updated", "your Images activity was updated but your video or more  activity was rejected")
  }
}



async function acceptActivity(){
  videosStatus=[]
  const res= await videoAnalysis(list[indexList].Video, list[indexList].Video2)  
    if(res){
    updateFirebase("your activity was accepted", "your Images activity was accepted but your video or more activity was rejected")
  
    }
}


function updateFirebase(message1,message2){
 let notificationMessage= message1
  list[indexList].Status=1

  videosStatus.map((value, key )=> {
        if(value === false || value === "video rekognition is not complete"){
            key == 0 ?  list[indexList].Video = "0":   list[indexList].Video2 = "0";
            notificationMessage= message2;
        }
   });
  
  User.doc(list[indexList].docId).update(list[indexList])
  .then(res =>{
    console.log(notificationMessage)
    nextList()
  })
  .catch(error =>{
    console.log("error:"+ error)
  })
}

const videoAnalysis= async(video1, video2)=>{
  if(video1 !== "0"){
  const resultResVideo1= await downloadVideo(video1)
  console.log(resultResVideo1)
  videosStatus.push(resultResVideo1)
  console.log("please wait one minute")
  await new Promise(resolve => setTimeout(resolve, 60000));
  }else{
    videosStatus.push(0)
  }

  if(video2 !== "0"){
  const resultResVideo2= await downloadVideo(video2)
  console.log(resultResVideo2)
  videosStatus.push(resultResVideo2)
  console.log("here videosStatus final result:"+ videosStatus)
  console.log("please wait one minute")
  await new Promise(resolve => setTimeout(resolve, 60000));
  }
  else{
    videosStatus.push(0)
    console.log("here videosStatus final result:"+ videosStatus)
  }
  return videosStatus;

}

function nextList(){
  console.log("continue")      
  indexList++;
     if(indexList !== lenList){
       acceptedImages=[]
       rejectedImages=[]
      getImages(list[indexList])
     }
}
