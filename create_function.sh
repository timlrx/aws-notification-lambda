#!/bin/bash

# Script to automatically add python lambda handler to deployment package 
# and create lambda function.
# Example usage - create_function.sh notify_discord

# Set env variables
set -o allexport; source .env; set +o allexport

if [[ $1 == *".js"* ]]; then
  echo "Error - entered name contains .js. Please input only the name of the function, without .js"
  exit 1
fi

zip -g deployment-package.zip $1.js

echo "Creating function $1..."

aws lambda create-function \
    --function-name $1 \
    --region us-east-1  \
    --zip-file fileb://deployment-package.zip \
    --handler $1.handler \
    --runtime nodejs16.x \
    --memory-size 128 \
    --timeout 10 \
    --environment Variables={WEBHOOK_URL=$WEBHOOK_URL} \
    --role $ROLE_ARN 
