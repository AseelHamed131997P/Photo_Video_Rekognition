
  var AWS = require("aws-sdk")
  const  {emcClientGet} = require('../config/amazon');
  const runModerationDetectionAndGetResults = require('./videoRekognition.js');

  const params1 = { MaxResults: 0 };
  const run = async () => {
    try {



        const endpointValue= await new Promise ((resolve, reject) => {
            emcClientGet.describeEndpoints(params1).promise()
            .then((data) => {
                console.log("Your MediaConvert endpoint is ", data.Endpoints);

              
              resolve(data.Endpoints); 
            }).catch(err => {
                console.log("Error", err);
              reject(`Failed to get MediaConvert endpoint: , ${err}`)
            });
          });
    } 
    
    catch (err) {
      console.log("Error", err);
    }

  };
  //run();


  const MyENDPOINT ="https://vasjpylpa.mediaconvert.us-east-1.amazonaws.com";
  const params = {
    UserMetadata: {
      Customer: "Amazon",
    },
    Role: "arn:aws:iam::012980054420:role/testMediaConverter", //IAM_ROLE_ARN
    Settings: {
      OutputGroups: [
        {
          Name: "File Group",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: "s3://testingrekognition123/", //OUTPUT_BUCKET_NAME, e.g., "s3://BUCKET_NAME/"
            },
          },
          Outputs: [
            {
              VideoDescription: {
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                Sharpness: 50,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    InterlaceMode: "PROGRESSIVE",
                    NumberReferenceFrames: 3,
                    Syntax: "DEFAULT",
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: "DISABLED",
                    SlowPal: "DISABLED",
                    SpatialAdaptiveQuantization: "ENABLED",
                    TemporalAdaptiveQuantization: "ENABLED",
                    FlickerAdaptiveQuantization: "DISABLED",
                    EntropyEncoding: "CABAC",
                    Bitrate: 5000000,
                    FramerateControl: "SPECIFIED",
                    RateControlMode: "CBR",
                    CodecProfile: "MAIN",
                    Telecine: "NONE",
                    MinIInterval: 0,
                    AdaptiveQuantization: "HIGH",
                    CodecLevel: "AUTO",
                    FieldEncoding: "PAFF",
                    SceneChangeDetect: "ENABLED",
                    QualityTuningLevel: "SINGLE_PASS",
                    FramerateConversionAlgorithm: "DUPLICATE_DROP",
                    UnregisteredSeiTimecode: "DISABLED",
                    GopSizeUnits: "FRAMES",
                    ParControl: "SPECIFIED",
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: "DISABLED",
                    FramerateNumerator: 30,
                    FramerateDenominator: 1,
                    ParNumerator: 1,
                    ParDenominator: 1,
                  },
                },
                AfdSignaling: "NONE",
                DropFrameTimecode: "ENABLED",
                RespondToAfd: "NONE",
                ColorMetadata: "INSERT",
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: "FOLLOW_INPUT",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: "NORMAL",
                      RateControlMode: "CBR",
                      CodecProfile: "LC",
                      CodingMode: "CODING_MODE_2_0",
                      RawFormat: "NONE",
                      SampleRate: 48000,
                      Specification: "MPEG4",
                      Bitrate: 64000,
                    },
                  },
                  LanguageCodeControl: "FOLLOW_INPUT",
                  AudioSourceName: "Audio Selector 1",
                },
              ],
              ContainerSettings: {
                Container: "MP4",
                Mp4Settings: {
                  CslgAtom: "INCLUDE",
                  FreeSpaceBox: "EXCLUDE",
                  MoovPlacement: "PROGRESSIVE_DOWNLOAD",
                },
              },
              NameModifier: "_1",
            },
          ],
        },
      ],
      AdAvailOffset: 0,
      Inputs: [
        {
          AudioSelectors: {
            "Audio Selector 1": {
              Offset: 0,
              DefaultSelection: "NOT_DEFAULT",
              ProgramSelection: 1,
              SelectorType: "TRACK",
              Tracks: [1],
            },
          },
          VideoSelector: {
            ColorSpace: "FOLLOW",
          },
          FilterEnable: "AUTO",
          PsiControl: "USE_PSI",
          FilterStrength: 0,
          DeblockFilter: "DISABLED",
          DenoiseFilter: "DISABLED",
          TimecodeSource: "EMBEDDED",
          FileInput: "s3://testingrekognition123/video.mp4", //INPUT_BUCKET_AND_FILENAME, e.g., "s3://BUCKET_NAME/FILE_NAME"
        },
      ],
      TimecodeConfig: {
        Source: "EMBEDDED",
      },
    },
  };
  

const mediaConverterAWS =()=>{

    return new Promise ((resolve, reject) => {
    new AWS.MediaConvert({ apiVersion: "2017-08-29", endpoint: MyENDPOINT }).createJob(params).promise()
    .then(async (data) => {
        console.log("job created and please wait one minute")
        await new Promise(resolve => setTimeout(resolve, 60000));
        const resultRes= await runModerationDetectionAndGetResults()
        console.log("the result of video rekognition is : "+ resultRes)
        resolve(resultRes)
      
    }).catch(err => {
        console.log("Error in mediaConverterAWS", err);
      reject("Error", err)
    });
  });

}


module.exports = mediaConverterAWS;
