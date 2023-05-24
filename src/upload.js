import axios from 'axios'
import fs from 'fs'
export async function uploadFileToTelegram(chatId, audioPath) {


    


  const botToken = '6098602544:AAE63bCybY1I3p860K3CH5d5hDowkbzCODc';


  try {
    const audioData = await fs.promises.readFile(audioPath);
    console.log("audioPath:"+audioPath)//////////////////////////////////
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendAudio`, {
      chat_id: chatId,
      audio: audioData,
    });
    console.log('Audio sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending audio:', error);
  }

/*
const apiId = '26676098602544';
 const apiHash = 'AAE63bCybY1I3p860K3CH5d5hDowkbzCODc5417';

    const formData = new FormData();
    formData.append('upload', fs.createReadStream(path));

    try {
       const response = await axios.post(`https://api.telegram.org/bot${apiId}:${apiHash}/getFile`, formData);
         console.log('File upload response:', response.data);
   } catch (error) {
          console.error('Error occurred during file upload:', error);
     }*/
}