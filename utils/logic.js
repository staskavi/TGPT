import { openai } from '../src/openai.js'
export const INITIAL_SESSION = {
  messages: [],
}
export async function initCommand(ctx) {
  ctx.session = INITIAL_SESSION
  console.log("logic.js")/////////////
  console.log(ctx.session)/////////////
  await ctx.reply('Waiting for voice or text message...')
}

