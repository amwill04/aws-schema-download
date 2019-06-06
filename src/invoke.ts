#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import AWS from 'aws-sdk';
import { buildClientSchema, getIntrospectionQuery, introspectionFromSchema } from 'graphql/utilities';
import program from 'commander';
import { GraphQLSchema } from 'graphql';
import { writeFileSync } from 'fs';
import chalk from 'chalk';

// Set cli program
program
    .version('0.0.1')
    .description('Download graphql schema with AWS IAM credentials')
    .option('--function-name <functionName>', 'The name of the Lambda function, version, or alias')
    .option('--profile <profile>', 'AWS profile to use [default]', 'default')
    .option('--region <region>', 'AWS lambda region, [us-east-1]', 'us-east-1')
    .option('--output <output>', 'Output schema file. [schema.json]', 'schema.json')
    .parse(process.argv);

if (!program.functionName) {
    console.error('Missing function name');
    process.exit(1);
}

if (program.profile !== 'default') {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: program.profile });
}

const query = getIntrospectionQuery();

const payload = {
    httpMethod: 'POST',
    body: JSON.stringify({ query }),
    headers: {},
};

const lambda = new AWS.Lambda({ region: program.region });

const invoke = lambda
    .invoke({
        FunctionName: program.functionName,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(payload),
    })
    .promise();

invoke
    .then(
        (response): GraphQLSchema => {
            return buildClientSchema(JSON.parse(JSON.parse(response.Payload as string).body).data);
        }
    )
    .then(
        (schema): void => {
            writeFileSync(program.output, JSON.stringify(introspectionFromSchema(schema), null, 2));
            console.log(chalk.green(`Saved schema at ${program.output}`));
            return;
        }
    )
    .catch(
        (error): void => {
            console.error(chalk.bold.red(error.message));
        }
    );
