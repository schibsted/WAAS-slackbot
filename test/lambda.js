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

  it('responds to file_created events from Slack, and errors on invalid file types', async () => {
    nock('https://slack.com')
      .post('/api/files.info')
      .reply(200, {
        ok: true,
        file: {
          url_private_download: "https://.../tedair.mp4"
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
            filetype: "srt",
            id: "F2147483862"
          }
        }
      })
    });

    assert.equal(response.body, "file_shared event received, but file format not supported");
    assert.equal(response.statusCode, 406);
  });

  it('responds to file_created events from Slack', async () => {
    nock('https://slack.com')
      .post('/api/files.info')
      .reply(200, {
        ok: true,
        file: {
          filetype: "mp4",
          url_private_download: "https://akamai.vgc.no/drfront/images/2022/10/14/c=0,401,4032,2626;w=1080;h=703;716869.jpg?format=auto",
          name: "tedair.mp4"
        }
      });

    nock("https://slack.com")
      .post('/api/chat.postMessage')
      .reply(200, {
        ok: true
      });

    nock("https://slack.com")
      .post('/api/files.upload')
      .reply(200, {
        ok: true
      });

    nock("https://waas.schibsted.io")
      .post("/")
      .query({task: "translate"})
      .reply(200)

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

    assert.equal(response.body, "file_shared event received and handled");
    assert.equal(response.statusCode, 200);
  });
});
