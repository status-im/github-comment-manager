FROM node:8.12-slim

WORKDIR /app

COPY package.json ./
RUN npm install --only=production

COPY dist/ ./

ENV LISTEN_PORT=8000

LABEL source="https://github.com/status-im/github-comment-manager" \
      description="Basic NodeJS API for managing CI build GitHub posts." \
      maintainer="jakub@status.im"

CMD ["npm", "start"]
EXPOSE $LISTEN_PORT
