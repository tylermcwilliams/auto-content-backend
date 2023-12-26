const express = require("express");
const router = express.Router();
const { googleAuth, googleAuthCallback } = require("./controllers/");
const {
  getVideo,
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
  getVideoThumbnail,
} = require("./controllers/");
const passport = require("./middleware");

/**
 * AUTH ROUTES
 */
router.get("/google", googleAuth);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback
);

/**
 * VIDEO ROUTES
 */
router.get("/video-thumbnail/:id", getVideoThumbnail);
router.get("/videos/:id", getVideo);
router.get("/video-list", listVideos);
router.post("/generate-video", generateVideo);
router.post("/process-video", processVideo);
router.post("/upload-video", uploadVideo);

module.exports = router;
