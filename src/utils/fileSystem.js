const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const util = require("util");
const execAsync = util.promisify(exec);

const localDataPath = path.join(__dirname, `../../../data/`);

const getMediaDir = () => {
  const outFolderPath = path.join(localDataPath, `out/`);
  return outFolderPath;
};

const getMediaPath = (id) => {
  const outFolderPath = getMediaDir();
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

const getCredentialsPath = () => {
  return path.join(localDataPath, "credentials/");
};

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

module.exports = {
  getMediaDir,
  getAssetPath,
  getMediaPath,
  getTempPath,
  cleanupTmpFolder,
  getCredentialsPath,
  saveImage,
};
