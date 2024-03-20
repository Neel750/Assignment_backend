/** @format */

// Load environment variables from .env file
const env = require('../env-loader');

// Import the AWS SDK
const AWS = require('aws-sdk');

// Configure AWS with your credentials and region
AWS.config.update({
	accessKeyId: env.AWS_ACCESS_KEY_ID,
	secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	region: env.AWS_REGION,
});

// Create a new DynamoDB DocumentClient
const db = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

module.exports = db;
