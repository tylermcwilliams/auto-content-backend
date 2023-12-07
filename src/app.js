const express = require("express");
const { gen_reel } = require("./services/mediaGeneration");
const { upload_to_youtube } = require("./services/socialMedia");
const { produceVideo } = require("./services/videoProduction");
const { reels: reel_templates } = require("../templates");

const app = express();
app.use(express.json()); // for parsing application/json

app.post("/generate-video", async (req, res) => {
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
});

app.post("/process-video", async (req, res) => {
  try {
    const { videoId } = req.body;
    await produceVideo(videoId);
    res.send("Video processing initiated.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/upload-video", async (req, res) => {
  try {
    const { videoId } = req.body;
    await upload_to_youtube(videoId);
    res.send("Video upload initiated.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
