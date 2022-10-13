exports.handler = async (event, context) => {
  let json;

  try {
    json = JSON.parse(event.body);
  } catch(error) {
    return {
      statusCode: 500,
      body: "error: " + error
    };
  };

  return {
    statusCode: 200,
    body: json.challenge
  };
}

