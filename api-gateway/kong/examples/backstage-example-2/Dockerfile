FROM node:12.21-alpine AS base

WORKDIR /opt/influxdb-retriever

RUN apk --no-cache add \
    bash \
    g++ \
    ca-certificates \
    lz4-dev \
    musl-dev \
    cyrus-sasl-dev \
    openssl-dev \
    make \
    python

RUN apk add --no-cache --virtual .build-deps \
    gcc \
    zlib-dev \
    libc-dev \
    bsd-compat-headers \
    py-setuptools \
    bash

COPY backstage-example-2/package.json package.json
COPY backstage-example-2/package-lock.json package-lock.json

RUN npm install  
#--only=prod

COPY  backstage-example-2/app ./app
COPY  backstage-example-2/api ./api
COPY  backstage-example-2/config ./config
COPY  backstage-example-2/index.js ./index.js

FROM node:12.21-alpine

WORKDIR /opt/influxdb-retriever

RUN apk --no-cache add \
    libsasl \
    lz4-libs \
    openssl \
    tini \
    curl

COPY --from=base /opt/influxdb-retriever /opt/influxdb-retriever


ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "influxdb-retriever"]

HEALTHCHECK --start-period=2m --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1