/* eslint-disable */

import awsLambdaFastify from "@fastify/aws-lambda";
import init from ".";

const handler = awsLambdaFastify(init());
export { handler };
