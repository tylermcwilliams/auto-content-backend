const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const util = require("util");
const execAsync = util.promisify(exec);

function splitIntoChunks(text, size) {
  const chunks = [];

  for (let i = 0; i < text.length; i += size) {
    const chunk = text.substring(i, i + size);
    chunks.push(chunk);
  }

  return chunks;
}

async function saveImage(outputPath, imageResponse) {
  const writer = fs.createWriteStream(outputPath);
  imageResponse.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log(`Image saved to ${outputPath}`);
      resolve(outputPath);
    });
    writer.on("error", reject);
  });
}

const getAudioDuration = async (audioPath) => {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return 0;
  }
};

const getMediaPath = (id) => {
  const outFolderPath = path.join(__dirname, `../out/`);
  return path.join(outFolderPath, `${id}`);
};

const getTempPath = (id) => {
  const mediaPath = getMediaPath(id);
  return path.join(mediaPath, `temp`);
};

const getAssetPath = (id) => {
  const mediaPath = getMediaPath(id);
  return path.join(mediaPath, "assets");
};

const cleanupTmpFolder = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    fs.unlinkSync(path.join(folderPath, file));
  }
  console.log("Temporary files cleaned up.");
};

const splitTextIntoChunks = (text, chunkSize) => {
  const minSize = 7;
  const maxSize = 9;
  const words = text.split(/\s+/);
  const chunks = [];

  let currentChunk = "";
  for (const word of words) {
    if (
      currentChunk.length + word.length + 1 <= maxSize ||
      currentChunk.length < minSize
    ) {
      currentChunk += (currentChunk.length > 0 ? " " : "") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};

module.exports = {
  splitIntoChunks,
  saveImage,
  getAudioDuration,
  getAssetPath,
  getMediaPath,
  getTempPath,
  splitTextIntoChunks,
  cleanupTmpFolder,
};
