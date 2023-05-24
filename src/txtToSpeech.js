import config from 'config';
import AWS from "aws-sdk";
import fs from "fs";

class TextToSpeech {

  async textToSpeechByPolly(data) {
    try {
      // Create an Polly client
      const Polly = new AWS.Polly({
        signatureVersion: "v4",
        AWS_SECRET_ACCESS_KEY: "Z1XCuh2D6dgy5FyekloQ7ghq9SkSW5mv/SLAxM/N",
        region: "us-east-1",
      });

      Polly.synthesizeSpeech(params, async (err, data) => {
        if (err) {
          console.log(err.code);
        } else if (data) {
          if (data.AudioStream instanceof Buffer) {
            //const speechPath = resolve(__dirname, '../voices', 'speech.ogg')
            fs.writeFile(speechPath, data.AudioStream, function (err) {
              if (err) {
                return console.log(err);
              }
              console.log("The file was saved!");
              console.log("speech.ogg path:" + speechPath); /////////////////////////////////
            });
          }
        }
      });
    } catch (e) {
      console.error("Error while textToSpeechByPolly", e.message);
    }
  } //textToSpeechByPolly
} //class TextToSpeech

export const TextToSpeech = new TextToSpeech();
