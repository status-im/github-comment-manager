FROM node:14.17-alpine

LABEL source="https://github.com/status-im/github-comment-manager" \
      description="Basic NodeJS API for managing CI build GitHub posts." \
      maintainer="jakub@status.im"

WORKDIR /app

COPY package.json ./
RUN yarn install --production

COPY src/ ./

ENV LOG_LEVEL=INFO \
    LISTEN_PORT=8000 \
    DB_SAVE_INTERVAL=5000 \
    DB_PATH='/tmp/builds.db' \
    GH_TOKEN='' \
    GH_REPO_OWNER='' \
    GH_REPO_NAME=''

CMD ["npm", "start"]
EXPOSE $LISTEN_PORT
