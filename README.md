# Slackbot for Whisper as a Service

Slackbot for for [Whisper as a Service](https://github.com/schibsted/WAAS)

## Dependencies

`$ npm run install --include=dev`

## Testing

`$ npm run test`

## Configuration

Set environment variable `WAAS_URL` to the URL of your Whisper as a Service.

## Deploying

#### Anywhere you want

You can deploy this script anywhere that runs Node.

#### AWS Lambda

It's a particularly good fit for a Lambda. Create your lambda, set the environment variables,
and configure the handler as lambda.handler. Then, run `AWS_LAMBDA_NAME=slack-transcribe-bot ./deploy.sh`
to deploy it.

If you haven't already, remember to install and configure your `aws` command line interface first:

* Log into your AWS Console and retrieve your IAM credentials.
* Run `aws configure` and follow the steps.
