var fs = require("fs");
var readline = require("readline");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;
const path = require("path");
const { getMediaPath, getCredentialsPath } = require("../../utils");

const CLIENT_IDX = 0;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ["https://www.googleapis.com/auth/youtube"];
var TOKEN_DIR = getCredentialsPath();
var TOKEN_PATH = path.join(TOKEN_DIR, `client_auth_${CLIENT_IDX}.json`);
// Load client secrets from a local file.

async function upload_to_youtube(id) {
  const metadata_path = path.join(getMediaPath(id), `metadata.json`);
  const video_path = path.join(getMediaPath(id), `output.mp4`);
  const data = fs.readFileSync(metadata_path);
  const metadata = JSON.parse(data);
  await upload(metadata, video_path);
}

async function upload(data, videoPath) {
  http: fs.readFile(`yt_api.json`, function processClientSecrets(err, content) {
    if (err) {
      console.log("Error loading  client secret file: " + err);
      return;
    }
    const { clients } = JSON.parse(content);
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(clients[CLIENT_IDX], async (auth) => {
      uploadVideo(auth, data, videoPath);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
  var service = google.youtube("v3");
  service.channels.list(
    {
      auth: auth,
      part: "snippet,contentDetails,statistics",
      //forUsername: "Destiny",
      mine: true,
    },
    function (err, response) {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      var channels = response.data.items;
      if (channels.length == 0) {
        console.log("No channel found.");
      } else {
        console.log(
          "This channel's ID is %s. Its title is '%s', and " +
            "it has %s views.",
          channels[0].id,
          channels[0].snippet.title,
          channels[0].statistics.viewCount
        );
      }
    }
  );
}

function uploadVideo(auth, data, videoPath) {
  var service = google.youtube("v3");
  service.videos.insert(
    {
      auth: auth,
      part: "snippet,status",
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: data.Title,
          description: data.Description,
          tags: data.Tags,
        },
        status: {
          privacyStatus: "private",
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    },
    function (err, response) {
      console.info(err, response);
      if (err) return console.log(err);
      console.info(response);
      updateVideo(auth, response.data.id);
    }
  );
}

async function updateVideo(auth, id) {
  var service = google.youtube("v3");
  service.videos.update(
    {
      auth: auth,
      part: "status",
      requestBody: {
        id: id,
        status: {
          privacyStatus: "public",
        },
      },
    },
    function (err, response) {
      console.info(err, response);
    }
  );
}

function updateChannel(auth) {
  var service = google.youtube("v3");
  service.channels.list(
    {
      auth: auth,
      part: "snippet,contentDetails,statistics",
      //forUsername: "Destiny",
      mine: true,
    },
    function (err, response) {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      var channels = response.data.items;
      if (channels.length == 0) {
        console.log("No channel found.");
      } else {
        const channel = channels[0];
        console.log(`
          This channel's ID is ${channel.id}. 
          Its title is '${channel.snippet.title}', 
          Description is '${channel.snippet.description}',
          andit has ${channel.statistics.viewCount} views.
          `);
        return;

        const newDescription = "This channel is for Trading";

        const updatedChannel = {
          id: channel.id,
          brandingSettings: {
            channel: {
              description: newDescription,
            },
          },
        };

        service.channels.update(
          {
            auth: auth,
            part: "brandingSettings",
            resource: updatedChannel,
          },
          function (err, response) {
            console.log("response", err);
            if (err) {
              console.log("The API returned an error: " + err);
              return;
            }
            console.log(response);
          }
        );
      }
    }
  );
}

module.exports = {
  upload_to_youtube,
  upload,
};
