const assert = require('assert');
const nock = require('nock');

const { handler } = require('../lambda');

describe('handler', () => {
  nock.disableNetConnect();

  it('returns HTTP 400 on invalid base64 in request body', async () => {
    const response = await handler({
      requestContext: {
        http: {
          method: "POST"
        }
      },
      isBase64Encoded: true,
      body: "{"
    });

    assert.equal(response.body, "Request body contains invalid Base64");
    assert.equal(response.statusCode, 500);
  });

  it('returns HTTP 400 on invalid JSON in request body', async () => {
    const response = await handler({
      requestContext: {
        http: {
          method: "POST"
        }
      },
      body: "{foo': bar"
    });

    assert.equal(response.body, "Request body contains invalid JSON");
    assert.equal(response.statusCode, 400);
  });

  it('responds to Slack API challenge', async () => {
    const response = await handler({
      requestContext: {
        http: {
          method: "POST"
        }
      },
      body: JSON.stringify({
        challenge: "foobar"
      })
    });

    assert.equal(response.body, "foobar");
    assert.equal(response.statusCode, 200);
  });

  it('responds to file_created events from Slack', async () => {
    nock('https://slack.com')
      .post('/api/files.info')
      .reply(200, {
        ok: true,
        file: {
          url_private_download: "https://.../tedair.gif"
        }
      });

    const response = await handler({
      requestContext: {
        http: {
          method: "POST"
        }
      },
      body: JSON.stringify({
        event: {
          type: "file_shared",
          file_id: "F2147483862",
          file: {
            id: "F2147483862"
          }
        }
      })
    });

    assert.equal(response.body, "file_shared event received");
    assert.equal(response.statusCode, 200);
  });
});
