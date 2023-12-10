const express = require("express");
const router = express.Router();
const {
  getVideo,
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
  getVideoThumbnail,
} = require("./controllers");

router.get("/video-thumbnail/:id", getVideoThumbnail);
router.get("/videos/:id", getVideo);
router.get("/video-list", listVideos);
router.post("/generate-video", generateVideo);
router.post("/process-video", processVideo);
router.post("/upload-video", uploadVideo);

module.exports = router;
