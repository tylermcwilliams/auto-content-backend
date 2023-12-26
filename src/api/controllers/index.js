const { googleAuth, googleAuthCallback } = require("./authControllers");
const {
  getVideoThumbnail,
  getVideo,
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
} = require("./mediaControllers");

module.exports = {
  googleAuth,
  googleAuthCallback,
  //MEDIA
  getVideoThumbnail,
  getVideo,
  listVideos,
  generateVideo,
  processVideo,
  uploadVideo,
};
