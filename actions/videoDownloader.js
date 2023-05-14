const fetch = require('node-fetch');
const fs = require('fs');
const uploadToS3= require("./uploadVideoToS3");


const downloadVideo = async(url)=>{

const response = await fetch(url);
const buffer = await response.buffer();


return new Promise(function(resolve, reject) {
    fs.writeFile(`./media/video.mp4`, buffer, async function(err,data) {
       if (err){ 
       console.log("Error when download video:" + err) 
       console.log(err);
       reject(err)
    }
       else{ 
        console.log('finished downloading video!')
        const stream = fs.createReadStream("./media/video.mp4");
          const resultRes=  await uploadToS3(stream)
          resolve(resultRes)
    
    };
    });
}
)

 }

 module.exports = downloadVideo;

