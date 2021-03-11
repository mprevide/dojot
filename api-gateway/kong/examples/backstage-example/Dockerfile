FROM node:12.18-alpine

WORKDIR /usr/src/app

COPY backstage-example/package.json package.json
COPY backstage-example/package-lock.json package-lock.json
COPY backstage-example/server.js server.js
COPY backstage-example/Utils.js Utils.js
COPY backstage-example/KeycloackAPi.js KeycloackAPi.js
COPY backstage-example/Config.js Config.js

RUN npm install

EXPOSE 8887

CMD ["npm","run","start"]