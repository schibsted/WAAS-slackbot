exports.handler = async (event, context) => {
  // Respond to challenge to verify bot with Slack
  if (event.queryStringParameters.get('challenge')) {
    return {
      statusCode: 200,
      body: event.queryStringParameters.challenge
    };
  }



}
