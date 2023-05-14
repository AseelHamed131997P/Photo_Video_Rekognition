const downloadVideo= require("./actions/videoDownloader")

const videoAnalysis= async()=>{
  const resultRes1= await downloadVideo("https://firebasestorage.googleapis.com/v0/b/acthub-5cf79.appspot.com/o/Video%2F_1649841876679.mp4?alt=media&token=aceb735b-6059-4f87-b6cd-07bdc0a2369b")
  console.log(resultRes1)




}

videoAnalysis()

