const { gen_reel } = require("../../services/mediaGeneration");
const { upload_to_youtube } = require("../../services/socialMedia");
const {
  produceVideo,
  generateThumbnail,
} = require("../../services/videoProduction");
const { reels: reel_templates } = require("../../../templates");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const { getMediaDir } = require("../../utils/fileSystem");

const DATA_FOLDER = getMediaDir(); // adjust this path to your data folder

const getVideoThumbnail = async (req, res) => {
  console.info(req.params.id);
  try {
    const dir = req.params.id;
    const pathToThumbnail = path.join(DATA_FOLDER, dir, "thumbnail.jpg");

    if (!fs.existsSync(pathToThumbnail)) {
      await generateThumbnail(dir);
    }

    res.sendFile(pathToThumbnail);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getVideo = async (req, res) => {
  console.info("in route for", req.params.id);
  try {
    console.info(req.params.id);
    const dir = req.params.id;
    // Set the path to your MP4 file
    const pathToMp4 = path.join(DATA_FOLDER, dir, "output.mp4");

    // Send the file
    res.sendFile(pathToMp4);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// TODO: Paginate results
const listVideos = async (req, res) => {
  try {
    console.info("in route to list");
    const directories = await readdir(DATA_FOLDER);
    const videos = await Promise.all(
      directories.map(async (dir) => {
        const metadataPath = path.join(DATA_FOLDER, dir, "metadata.json");
        if (!fs.existsSync(metadataPath)) {
          return null;
        }
        const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
        return {
          id: dir,
          data: metadata,
          //output: path.join(DATA_FOLDER, dir, "output.mp4"),
        };
      })
    );
    const filteredVideos = videos.filter((video) => video !== null);
    console.info(filteredVideos.length);
    res.json(filteredVideos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const generateVideo = async (req, res) => {
  console.info("in route", req.body);
  try {
    const { templateName, subject } = req.body;
    console.info(templateName);
    const template = reel_templates[templateName || "top3"];
    if (!template) {
      return res.status(404).send("Template not found");
    }
    const strat = { subject, ...template };
    const videoData = await gen_reel(strat);
    res.json(videoData);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const processVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    await produceVideo(videoId);
    res.send("Video processing initiated.");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const uploadVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    await upload_to_youtube(videoId);
    res.send("Video upload initiated.");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getVideoThumbnail,
  getVideo,
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
};
