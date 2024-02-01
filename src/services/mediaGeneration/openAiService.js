require("dotenv").config();
const OpenAI = require("openai");
const axios = require("axios");

const { OPEN_AI_KEY } = process.env;

const openai = new OpenAI({
  apiKey: OPEN_AI_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

async function gen_text(prompt) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
    n: 1,
    max_tokens: 500,
  });

  return chatCompletion.choices[0].message.content;
}

async function gen_image(prompt) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });

  const imageUrl = response.data[0].url;

  // Download and save the image
  const imageResponse = await axios({
    method: "get",
    url: imageUrl,
    responseType: "stream",
  });

  return imageResponse;
}

async function gen_audio(prompt) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: prompt,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return buffer;
}

module.exports = {
  gen_text,
  gen_image,
  gen_audio,
};
