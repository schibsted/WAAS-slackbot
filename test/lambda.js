const assert = require('assert');

const { handler } = require('../lambda');

describe('handler', () => {
  it('responds to Slack API challenge', async () => {
    const response = await handler({
      body: JSON.stringify({
        challenge: "foobar"
      })
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, "foobar");
  });
});
