exports.handler = async (event, context) => {
  if (event.requestContext.http.method == "POST") {
    let body;
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
      json = JSON.parse(event.body)
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
  }
}

