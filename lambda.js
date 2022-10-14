const path = require('path');
const fs = require('fs');
const undici = require('undici');
const { WebClient: Slack } = require("@slack/web-api");

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


      const { PassThrough } = require("stream");
      const { createReadStream, createWriteStream } = require("fs");
      console.log(fileInfo.file.url_private_download);
      const readStream = await undici.stream([fileInfo.file.url_private_download, { method: "GET" }]);
      const writeStream = await undici.stream(["http://localhost:8080", { method: "POST" }]);

      const tunnel = new PassThrough();
      tunnel.on("data", (chunk) => {
        console.log("bytes:", chunk); // bytes: <Buffer 23 20 4a 61 76 61 53 63 72 69 70 74 20 41 6c 67 6f 72 69 74 68 6d 73 20 61 6e 64 20 44 61 74 61 20 53 74 72 75 63 74 75 72 65 73 0a 0a 54 68 69 73 20 ... 1767 more bytes>
      });
      readStream.pipe(tunnel).pipe(writeStream);


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

