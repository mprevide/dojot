FROM node:12.18-alpine AS base

WORKDIR /usr/src/app

COPY server-api-example/package.json package.json
COPY server-api-example/package-lock.json package-lock.json
COPY server-api-example/server.js .

RUN npm install

EXPOSE 8888

CMD [ "npm", "run", "start"]