const { gen_reel } = require("../services/mediaGeneration");
const { upload_to_youtube } = require("../services/socialMedia");
const { produceVideo } = require("../services/videoProduction");
const { reels: reel_templates } = require("../../templates");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const { getMediaDir } = require("../utils/fileSystem");

const DATA_FOLDER = getMediaDir(); // adjust this path to your data folder

const getVideo = async (req, res) => {
  try {
    console.info(req.params.id);
    const dir = req.params.id;
    // Set the path to your MP4 file
    const video = path.join(DATA_FOLDER, dir, "output.mp4");
    const pathToMp4 = path.join(__dirname, "your-video.mp4");

    // Send the file
    res.sendFile(pathToMp4);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// TODO: Paginate results
const listVideos = async (req, res) => {
  try {
    console.info("in route");
    const directories = await readdir(DATA_FOLDER);
    const videos = await Promise.all(
      directories.map(async (dir) => {
        const metadataPath = path.join(DATA_FOLDER, dir, "metadata.json");
        const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
        return {
          id: dir,
          data: metadata,
          //output: path.join(DATA_FOLDER, dir, "output.mp4"),
        };
      })
    );

    res.json(videos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const generateVideo = async (req, res) => {
  try {
    const { templateName, subject } = req.body;
    const template = reel_templates[templateName || "top3"];
    if (!template) {
      return res.status(404).send("Template not found");
    }
    const strat = { subject, ...template };
    await gen_reel(strat);
    res.send("Video generation initiated.");
  } catch (error) {
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
  getVideo,
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
};
