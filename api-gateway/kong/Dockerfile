FROM kong:2.0.4-alpine as builder

USER root

ENV LUAROCKS_MODULE=kong-plugin-jwt-keycloak

RUN apk add --no-cache git zip && \
    git config --global url.https://github.com/.insteadOf git://github.com/ && \
    luarocks install ${LUAROCKS_MODULE} && \
    luarocks pack ${LUAROCKS_MODULE}

## Create image
FROM kong:2.0.4-alpine

COPY kong.conf /etc/kong/

USER root

COPY --from=builder kong-plugin-jwt-keycloak* /tmp/
RUN luarocks install /tmp/kong-plugin-jwt-keycloak* && rm /tmp/*

WORKDIR /custom-plugins/pepkong
COPY ./plugins/pepkong /custom-plugins/pepkong
RUN luarocks make

USER kong
