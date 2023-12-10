const express = require("express");
const { gen_reel } = require("./services/mediaGeneration");
const { upload_to_youtube } = require("./services/socialMedia");
const { produceVideo } = require("./services/videoProduction");
const { reels: reel_templates } = require("../templates");
const cors = require("cors");

const app = express();
app.use(express.json()); // for parsing application/json
app.use(cors());

app.use("/api", require("./api/routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
