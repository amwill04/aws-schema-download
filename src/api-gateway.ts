#!/usr/bin/env node

import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { buildClientSchema, getIntrospectionQuery, introspectionFromSchema } from 'graphql/utilities';
import https from 'https';
import AWS from 'aws-sdk';
import aws4 from 'aws4';
import program from 'commander';

// Set cli program
program
    .version('0.0.1')
    .description('Download graphql schema with AWS IAM credentials')
    .option('--profile <profile>', 'AWS profile to use [default]', 'default')
    .option('--endpoint <endpoint>', 'Graphql endpoint')
    .option('--region <region>', 'AWS service region [eu-east-1]')
    .option('--output <output>', 'Output schema file. [schema.json]', 'schema.json')
    .parse(process.argv);

// If profile is not default then load from profile
if (program.profile !== 'default') {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: program.profile });
}

// Environment variables take precendence
if (process.env.ACCESS_KEY_ID) {
    AWS.config.credentials.accessKeyId = process.env.ACCESS_KEY_ID;
}

if (process.env.SECRET_ACCESS_KEY) {
    AWS.config.credentials.secretAccessKey = process.env.SECRET_ACCESS_KEY;
}

// Check that credentials are set
const { accessKeyId, secretAccessKey } = AWS.config.credentials;

if (!(typeof accessKeyId === 'string' && typeof secretAccessKey === 'string')) {
    console.error(chalk.bold.red('Missing AWS credentials'));
    process.exit(1);
}

if (typeof program.endpoint !== 'string') {
    console.error(chalk.bold.red('Missing host'));
    process.exit(1);
}

// Set request options
const url = new URL(program.endpoint);

const body = JSON.stringify({
    query: getIntrospectionQuery(),
});

const options = {
    region: 'eu-west-2',
    service: 'execute-api',
    host: url.host,
    path: url.pathname,
    method: 'POST',
    body,
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
    },
};

// Sign with AWS version 4
const signedRequest = aws4.sign(options, {
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
});

// Remove superfolous options
delete signedRequest.headers['Host'];
delete signedRequest.body;

// Send request
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let responseString = '';
const request = https.request(
    signedRequest,
    (response): void => {
        response.setEncoding('utf8');
        response.on('data', function(chunk): void {
            responseString += chunk;
        });
        response.on(
            'end',
            (): void => {
                if (responseString === '') {
                    console.error('Missing repsone schema. Status code: %d', response.statusCode);
                    process.exit(1);
                }
                const schemaJson = JSON.parse(responseString);
                const schema = buildClientSchema(schemaJson.data);
                fs.writeFileSync(
                    path.join(process.cwd(), program.output),
                    JSON.stringify(introspectionFromSchema(schema), null, 2)
                );
                console.log('Successfully saved schema from %s', program.endpoint);
            }
        );
    }
);

request.write(body);
request.end();
