exports.handler = async (event, context) => {
  if (event.requestContext.http.method == "POST") {
    let json;

    try {
      json = JSON.parse(event.body)
    } catch(error) {
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

