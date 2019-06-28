# AWS Lambda Graphql Schema Download

AWS schema download CLI to download GraphQL schema from AWS lambda when GraphQL server is via API Gateway and has an authorizer.

# Usage

```sh-session
$ npm install -g  @awill1004/aws-schema-graphql
$ aws-schema-graphql --function-name labmda-name
```

### Arguments

```
Usage: aws-schema-download [options]

Download graphql schema from lambda

Options:
  -V, --version                   output the version number
  --function-name <functionName>  The name of the Lambda function, version, or alias
  --profile <profile>             AWS profile to use [default] (default: "default")
  --region <region>               AWS lambda region, [us-east-1] (default: "us-east-1")
  --output <output>               Output schema file. [schema.json] (default: "schema.json")
  -h, --help                      output usage information
```


#### TODO

Work in progress
* Export module to use in scripts
* Add API Gateway support with signed AWS signature
