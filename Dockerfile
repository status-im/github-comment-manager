FROM node:10.14-alpine

WORKDIR /app

COPY package.json ./
RUN yarn install --production

COPY dist/ ./

ENV LISTEN_PORT=8000 \
    DB_SAVE_INTERVAL=5000 \
    DB_PATH='/tmp/builds.db' \
    GH_TOKEN='' \
    GH_REPO_OWNER='' \
    GH_REPO_NAME=''

LABEL source="https://github.com/status-im/github-comment-manager" \
      description="Basic NodeJS API for managing CI build GitHub posts." \
      maintainer="jakub@status.im"

CMD ["npm", "start"]
EXPOSE $LISTEN_PORT
