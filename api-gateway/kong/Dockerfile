# based on https://github.com/gbbirkisson/kong-plugin-jwt-keycloak/blob/master/Dockerfile that is licensed under Apache-2.0 License
FROM kong:2.0.4-alpine as builder
#kong:2.2-alpine

USER root

# Getting the code from repository of Kong plugin jwt-keycloak that is licensed under Apache-2.0 License
ENV GIT_PLUGIN_REPOSOTORY_URL=https://github.com/gbbirkisson/kong-plugin-jwt-keycloak.git
ENV GIT_PLUGIN_COMMIT_OR_VERSION=9a5728c0858ded473e1032e0219653d9502b0e16

RUN apk add --no-cache git zip

WORKDIR /tmp

RUN git clone ${GIT_PLUGIN_REPOSOTORY_URL}
RUN ls -la

WORKDIR /tmp/kong-plugin-jwt-keycloak
RUN ls -la
RUN git checkout ${GIT_PLUGIN_COMMIT_OR_VERSION}

RUN luarocks make && luarocks pack kong-plugin-jwt-keycloak

## Create image
FROM kong:2.0.4-alpine

# copy default config
COPY kong.conf /etc/kong/

USER root

COPY --from=builder /tmp/kong-plugin-jwt-keycloak/*.rock /tmp/
RUN luarocks install /tmp/kong-plugin-jwt-keycloak* && rm /tmp/*

# copy and install the dojot plugin, the pepkong
WORKDIR /custom-plugins/pepkong
COPY ./plugins/pepkong /custom-plugins/pepkong
RUN luarocks make

USER kong

# healthcheck:
#   test: ["CMD", "kong", "health"]
#   interval: 10s
#   timeout: 10s
#   retries: 10

HEALTHCHECK --start-period=2m --interval=30s --timeout=10s --retries=3 \
    CMD kong health || exit 1