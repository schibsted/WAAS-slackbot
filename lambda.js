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

      console.log(`File url_private_download: ${fileInfo.file.url_private}`);

      return {
        statusCode: 200,
        body: "file_shared event received"
      }
    };
  }
}

