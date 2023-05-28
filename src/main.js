import { Telegraf, session } from "telegraf";
import { initCommand, INITIAL_SESSION } from "../utils/logic.js";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import config from "config";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeVoices } from "../utils/remove_voices.js";
const __dirname = dirname(fileURLToPath(import.meta.url));


// Load the SDK
import AWS from "aws-sdk";
import fs from "fs";
// Retrieve AWS credentials from your configuration
const awsAccessKeyId = config.get('AWS_ACCESS_KEY_ID');
const awsSecretAccessKey = config.get('AWS_SECRET_ACCESS_KEY');
const awsRegion = config.get('region');
const awssignatureVersion = config.get('signatureVersion');
// Configure the AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
  region: awsRegion,
  signatureVersion: awssignatureVersion
});

// Instantiate the Polly client
const Polly = new AWS.Polly();


const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("new", initCommand);
bot.command("start", initCommand);

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  console.log("voice"); /////////////////
  console.log(ctx.session); //////////////
  try {
    await ctx.reply(code("Waiting response from server..."));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    //removeVoices(oggPath)
    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Your request: ${text}`));
    removeVoices(oggPath)
    removeVoices(mp3Path)

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: text,
    });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });
    //////
    ///////////
    const params = {
      Text: `${response.content}`,
      OutputFormat: "ogg_vorbis",
      VoiceId: "Amy",
      Engine: "neural", // or 'standard'
      LanguageCode: "en-GB" 
    };
    const speechPath = resolve(__dirname, "../voices", "speech.ogg");
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

            ctx
              .replyWithAudio({ source: speechPath })
              .then((response) => {
                console.log("Voice message sent:", response);
                removeVoices(speechPath);
              })
              .catch((error) => {
                console.error("Error sending voice message:", error);
              });
            /////////////////////////
          });
        }
      }
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.error(`Error while processing voice and text message`, e.message);
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  console.log("text"); /////////////////////
  console.log(ctx.session); ///////////////
  try {
    await ctx.reply(code("Waiting response from server..."));

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.log(`Error while processing text message`, e.message);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
