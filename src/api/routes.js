const express = require("express");
const router = express.Router();
const {
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
} = require("./controllers");

router.get("/list-videos", listVideos);
router.post("/generate-video", generateVideo);
router.post("/process-video", processVideo);
router.post("/upload-video", uploadVideo);

module.exports = router;
