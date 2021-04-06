FROM node:12.18-alpine

WORKDIR /usr/src/app

# COPY dojot-mock/package.json package.json
# COPY dojot-mock/package-lock.json package-lock.json
# COPY dojot-mock/server.js server.js
# COPY dojot-mock/mock.js mock.js


COPY package.json package.json
COPY package-lock.json package-lock.json
COPY server.js server.js
COPY mock.js mock.js

RUN npm install

EXPOSE 8888

CMD ["npm","run","start"]