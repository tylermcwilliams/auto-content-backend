require("dotenv").config();
const fs_prom = require("fs").promises;
const fs = require("fs");
const path = require("path");
const { v4: gen_uuid } = require("uuid");
const { gen_audio, gen_image, gen_text } = require("./openAiService");
const { produceVideo } = require("../videoProduction/ffmpegService");
const { upload_to_youtube } = require("../socialMedia/youtube");
const {
  getMediaPath,
  getTempPath,
  getAssetPath,
  saveImage,
} = require("../../utils");

async function gen_reel(strat) {
  const id = gen_uuid();
  console.info("Generating reel: ", id);

  const temp_path = getTempPath(id);
  fs.mkdirSync(temp_path, { recursive: true });
  const asset_path = getAssetPath(id);
  fs.mkdirSync(asset_path, { recursive: true });

  const { subject, descriptor, lang } = strat;
  const data_string = await prep_text(id, subject, descriptor, lang);
  const data = JSON.parse(data_string);
  console.info(data);
  const audio_assets = await prep_audio(id, data.Story);
  console.info(audio_assets);
  const image_assets = await prep_images(id, data.Story);
  console.info(image_assets);

  // PREP METADATA OBJECT
  data.id = id;
  data.Images = image_assets;
  data.Audio = audio_assets;
  const outputPath = path.join(getMediaPath(id), `metadata.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data));

  // PRODUCE VIDEO
  await produceVideo(id);
  // UPLOAD
  await upload_to_youtube(id);
}

async function prep_text(id, idea, descriptor, lang) {
  console.info("Preparing text for story: ", idea);

  const prompt = get_prompt(idea, descriptor, lang);
  const story = await gen_text(prompt);

  return story;
}

async function prep_audio(id, Story) {
  const assets = [];
  const audio_prompts = Story;

  console.info("Preparing audio for story: ", id);
  for (const [index, prompt] of audio_prompts.entries()) {
    const file = `audio_${index}.mp3`;
    const buffer = await gen_audio(prompt);
    const outputPath = path.join(getAssetPath(id), file);
    await fs_prom.writeFile(outputPath, buffer);
    assets.push(outputPath);
  }

  return assets;
}

async function prep_images(id, Story) {
  const assets = [];
  const image_prompts = Story.map((sentence) => {
    return "Realistic photo style with no text, of " + sentence;
  });

  console.info("Preparing images for story: ", id);
  for (const [index, prompt] of image_prompts.entries()) {
    const file = `image_${index}.jpg`;
    const imageResponse = await gen_image(prompt);
    const outputPath = path.join(getAssetPath(id), file);
    await saveImage(outputPath, imageResponse);
    assets.push(outputPath);
  }

  return assets;
}

const get_prompt = (idea, descriptor, lang = "english") => {
  const n = 3;
  return `Write ${n} very short sentences in the ${lang} language for a story about the ${idea}. 
    Should be ${descriptor}. 
    Write a JSON object with Title, Story, Description, and a list of Tags in JSON format. 
    The Title should be very click-bait and exaggerated and less than 5 words. 
    The Story should be JSON array list of sentences.`;
};

module.exports = {
  gen_reel,
};
