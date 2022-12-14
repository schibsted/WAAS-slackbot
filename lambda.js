const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { WebClient: Slack } = require("@slack/web-api");
const fs = require('node:fs');
const { createReadStream } = require('node:fs');

const slack = new Slack(process.env.SLACK_TOKEN);

exports.handler = async (event, context) => {
  console.log(event);

  if (event.requestContext.http.method == "POST") {
    let body = event.body;
    let json;

    if (event.isBase64Encoded) {
      try {
        body = atob(event.body);
      } catch (error) {
        return {
          statusCode: 500,
          body: "Request body contains invalid Base64"
        }
      }
    }

    try {
      json = JSON.parse(body)
    } catch (error) {
      return {
        statusCode: 400,
        body: "Request body contains invalid JSON"
      }
    }

    if (json.challenge) {
      return {
        statusCode: 200,
        body: json.challenge
      };
    }

    if (json.event.type == "file_shared") {
      const fileInfo = await slack.files.info({file: json.event.file_id});

      console.log(`slack.files.info: ${JSON.stringify(fileInfo)}`);

      if (!["mp4", "mp3", "wav"].includes(fileInfo.file.filetype)) {
        console.log("file_shared event received, but file format not supported");

        return {
          statusCode: 406,
          body: "file_shared event received, but file format not supported"
        }
      }

      function changeExtension(file, extension) {
        const basename = path.basename(file, path.extname(file))
        return path.join(path.dirname(file), basename + extension)
      }

      await slack.chat.postMessage({
        channel: json.event.channel_id,
        text: "I noticed you posted an audio or video file, so I'm making subtitles for you!"
      });

      // Download the file
      response = await fetch(fileInfo.file.url_private_download);
      const fileStream = fs.createWriteStream("/tmp/audio");
      await new Promise((resolve, reject) => {
          response.body.pipe(fileStream);
          response.body.on("error", reject);
          fileStream.on("finish", resolve);
        });

      // Upload the file
      const formData = new FormData();
      const stream = createReadStream("/tmp/audio");
      //const file = new fileFromSync("/tmp/audio", fileInfo.file.mimetype);
      formData.append("file", stream, fileInfo.file.name);

      response2 = await fetch(`${process.env.WAAS_URL}/?model=large&task=translate`, {
        method: "post",
        body: formData
      });

      await slack.files.upload({
        channels: json.event.channel_id,
        title: changeExtension(fileInfo.file.name, ".srt"),
        //title: fileInfo.file.name + ".srt",
        content: "This is a dummy SRT file :)"
      });

      return {
        statusCode: 200,
        body: "file_shared event received and handled"
      }
    };
  }
}

