#!/bin/bash

# Сборка React приложения
echo "Building React application..."
npm run build

# Если вы используете Netlify CLI для деплоя
if command -v netlify &> /dev/null; then
  echo "Deploying to Netlify..."
  netlify deploy --prod --dir=build
else
  echo "Netlify CLI not found. Please install it with: npm install -g netlify-cli"
  echo "Or deploy manually by uploading the 'build' directory to Netlify."
fi

echo "Done!" 