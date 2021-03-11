FROM node:12.18-alpine

WORKDIR /opt/backstage

COPY backstage-example/package.json package.json
COPY backstage-example/package-lock.json package-lock.json
COPY backstage-example/src ./src

RUN npm install --only=prod

EXPOSE 8887

CMD ["npm","run","start"]