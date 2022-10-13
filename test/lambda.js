const assert = require('assert');

const { handler } = require('../lambda');

describe('handler', () => {
  it('returns HTTP 400 on invalid JSON in request body', async () => {
    const response = await handler({
      httpMethod: "POST",
      body: "{foo': bar"
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body, "Request body contains invalid JSON");
  });

  it('responds to Slack API challenge', async () => {
    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        challenge: "foobar"
      })
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, "foobar");
  });
});
