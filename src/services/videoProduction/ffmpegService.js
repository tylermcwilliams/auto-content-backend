const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const path = require("path");
const {
  getAudioDuration,
  splitTextIntoChunks,
  getAssetPath,
  getMediaPath,
  getTempPath,
} = require("../../utils");

const fontPath = "/usr/share/fonts/truetype/malayalam/Dyuthi-Regular.ttf";

const createVisualVideo = async (
  index,
  imagePath,
  tempPath,
  duration,
  text
) => {
  try {
    console.info(`Audio duration: ${duration} seconds`);

    const textChunks = splitTextIntoChunks(text, 1);
    const chunkDuration = duration / textChunks.length;
    const tempFiles = [];

    for (let i = 0; i < textChunks.length; i++) {
      const textChunk = textChunks[i];
      const tempFile = `${tempPath}/temp_v_${index}_${i}.mp4`;
      const ffmpegCommand = `ffmpeg -loop 1 -i "${imagePath}" -vf "drawtext=fontfile=${fontPath}:text='${textChunk}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=128:fontcolor=white:bordercolor=black:borderw=2" -t ${chunkDuration} -pix_fmt yuv420p "${tempFile}"`;
      await execAsync(ffmpegCommand);
      tempFiles.push(tempFile);
    }
    const fileList = tempFiles.map((file) => `file '${file}'`).join("\n");
    const tmpFileListPath = path.join(tempPath, `filelist_${index}.txt`);
    fs.writeFileSync(tmpFileListPath, fileList);
    await execAsync(
      `ffmpeg -f concat -safe 0 -i ${tmpFileListPath} -c copy "${tempPath}/temp_v_${index}.mp4"`
    );
  } catch (error) {
    console.error("Error creating video:", error);
  }
};

const createIndividualVideo = async (
  index,
  imagePath,
  audioPath,
  outputPath,
  tempPath,
  text
) => {
  try {
    const pattern = /\W/g;
    text = text.replace(pattern, " ");

    const duration = await getAudioDuration(audioPath);

    await createVisualVideo(index, imagePath, tempPath, duration, text);

    await execAsync(
      `ffmpeg -i "${tempPath}/temp_v_${index}.mp4" -i "${audioPath}" -c:v copy -c:a aac -strict experimental "${outputPath}"`
    );

    console.info(`Video created at ${outputPath}`);
  } catch (error) {
    console.error("Error creating video:", error);
  }
};

const createVideoFromImages = async (
  texts,
  audio_assets,
  image_assets,
  outputPath,
  tempPath
) => {
  try {
    const videoCreationPromises = texts.map((sentence, index) => {
      const text = sentence.replace(/'/g, "\\'");
      const imagePath = image_assets[index]; //path.join(__dirname, `../tmp/${index}.jpg`); // You can change the filename and path as needed
      const audioPath = audio_assets[index]; //path.join(__dirname, `../tmp/${file}`); // You can change the filename and path as needed
      const partOutputPath = path.join(tempPath, `temp_${index}.mp4`); // You can change the filename and path as needed
      return createIndividualVideo(
        index,
        imagePath,
        audioPath,
        partOutputPath,
        tempPath,
        text
      );
    });

    // Wait for all videos to be created
    await Promise.all(videoCreationPromises);

    // Create file listing all temporary videos
    const fileList = texts
      .map((_, index) => `file '${tempPath}/temp_${index}.mp4'`)
      .join("\n");
    const tmpFileListPath = path.join(tempPath, `filelist_final.txt`);
    fs.writeFileSync(tmpFileListPath, fileList);

    // Concatenate all videos
    await execAsync(
      `ffmpeg -f concat -safe 0 -i ${tmpFileListPath} -c copy ${outputPath}`
    );
    console.log("Final video created successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
};

async function produceVideo(id) {
  const metadata_path = path.join(getMediaPath(id), `metadata.json`);

  const data = fs.readFileSync(metadata_path);
  const metadata = JSON.parse(data);

  const temp_path = getTempPath(id);
  const video_path = path.join(getMediaPath(id), `output.mp4`);

  await createVideoFromImages(
    metadata.Story,
    metadata.Audio,
    metadata.Images,
    video_path,
    temp_path
  );
}

module.exports = {
  createVideoFromImages,
  produceVideo,
};
