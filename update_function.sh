#!/bin/bash

if [[ $1 == *".js"* ]]; then
  echo "Error - entered name contains .js. Please input only the name of the function, without .js"
  exit 1
fi

# Add / update lambda file to deployment-package
zip -g deployment-package.zip $1.js

echo " function $1..."

aws lambda update-function-code \
    --function-name $1 \
    --region us-east-1  \
    --zip-file fileb://deployment-package.zip
