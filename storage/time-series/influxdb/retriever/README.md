# InfluxDB Retriever

The **InfluxDB Retriever** is responsible for data recovery from device data series at InfluxDB.

## **Table of Contents**

1. [Overview](#overview)
    1. [Reading data from InfluxDB](#reading-data-from-influxdb)
2. [Dependencies](#dependencies)
   1. [Dojot Services](#dojot-services)
   2. [Others Services](#others-services)
3. [Running the service](#running-the-service)
   1. [Configurations](#configurations)
        1. [General Configurations](#general-configurations)
        2. [Server Configurations](#server-configurations)
        3. [InfluxDB Configurations](#influxdb-configurations)
        4. [Service State Manager](#service-state-manager)
   2. [How to run](#how-to-run)
4. [Documentation](#documentation)
5. [Issues and help](#issues-and-help)

## Overview

### Reading device data from InfluxDB

When using the endpoints of this service it is possible to obtain data for a given device.
This service maps an influxdb device as follows:

- *Organization* = **tenant**
- *measurement* = **deviceid**
- *bucket* = config default
- Each `key` from `attrs` will be a *field* with their respective values.


## Dependencies

The services dependencies are listed in the next topics.

- Dojot Services
- Others Services: They are external services;

### Dojot Services

none

### Others Services

- InfluxDB (tested using InfluxDB version 2.0.0-rc)

## Running the service

### Configurations

Before running the **InfluxDB Storer** service within your environment, make sure you configure the
environment variables to match your needs.

You can select the configuration file via the `RETRIEVER_APP_USER_CONFIG_FILE` variable. Its default value
is `production.conf`. Check the [config directory](./config) for the user configurations that are
available by default.

For more information about the usage of the configuration files and environment variables, check the
__ConfigManager__ module in our [Microservice SDK](https://github.com/dojot/dojot-microservice-sdk-js).
You can also check the [ConfigManager environment variables documentation](https://github.com/dojot/dojot-microservice-sdk-js/blob/master/lib/configManager/README.md#environment-variables) for more details.

In short, all the parameters in the next sections are mapped to environment variables that begin
with `RETRIEVER_`. You can either use environment variables or configuration files to change their values.
You can also create new parameters via environment variables by following the fore mentioned
convention.

#### General Configurations

| Key | Purpose | Default Value | Valid Values | Environment variable
| --- | ------- | ------------- | ------------ | --------------------
| log.console.level | Console logger level | info | info, debug, error, warn | RETRIEVER_LOG_CONSOLE_LEVEL
| log.file | Enables logging on file (location: /var/log/influxdb-retriever-logs-%DATE%.log) | false | boolean  | RETRIEVER_LOG_FILE
| log.file.level  | Log level to log on files | debug | string  | RETRIEVER_LOG_LEVEL
| log.verbose | Whether to enable logger verbosity or not | false | boolean | RETRIEVER_LOG_VERBOSE
| paginate.default.max.limit |  Sets maximum and default the item numbers on each page  | 256 | integer | RETRIEVER_PAGINATE_DEFAULT_MAX_LIMIT

#### Server Configurations

| Key | Purpose | Default Value | Valid Values | Environment variable
| --- | ------- | ------------- | ------------ | --------------------
| server.ca | File path to list of supplied CAs. if passed enable TLS  | none | path  | RETRIEVER_SERVER_CA
| server.cert | File path to  certificate.  | none | path| RETRIEVER_SERVER_CERT
| server.host | Server Hostname | 0.0.0.0 | string  | RETRIEVER_SERVER_HOST
| server.key | File path to private key certificate. | none | path |  RETRIEVER_SERVER_KEY
| server.port | Sever Port  | 3000 | integer  | RETRIEVER_SERVER_PORT
| server.reject.unauthorized | If true, the server certificate is verified against the list of supplied CAs. | none | boolean | RETRIEVER_SERVER_REJECT_UNAUTHORIZED
| server.request.cert | Whether to authenticate the remote peer by requesting a certificate. Clients always request a server certificate. | none | boolean | RETRIEVER_SERVER_REQUEST_CERT
| server.trustproxy | Enables reverse proxy support  | true | boolean | RETRIEVER_SERVER_TRUSTPROXY
| server.cors | Enables Cross-origin Resource Sharing  | true | boolean |  RETRIEVER_SERVER_CORS

#### InfluxDB Configurations

| Key | Purpose | Default Value | Valid Values | Environment variable
| --- | ------- | ------------- | ------------ | --------------------
| influx.default.bucket | Bucket name for all created buckets | devices | string  | RETRIEVER_INFLUX_DEFAULT_BUCKET
| influx.default.token | Configure a token (this token will be allowed to write/read in all organizations) | dojot@token_default | string  | RETRIEVER_INFLUX_DEFAULT_TOKEN
| influx.heathcheck.ms | Specific how often it is to check if it is possible to communicate with the *InfluxDB* service in milliseconds.  | 60000 | integer  | RETRIEVER_INFLUX_HEATHCHECK_MS
| influx.url | Address of the *InfluxDB* service  | http://influxdb:8086 | url | RETRIEVER_INFLUX_URL

#### Service State Manager

These parameters are passed directly to the SDK ServiceStateManager. Check the
[official repository](https://github.com/dojot/dojot-microservice-sdk-js) for more info on the
values.

| Key | Default Value | Valid Values | Environment variable
| --- | ------------- | ------------ | --------------------
| lightship.detect.kubernetes | false | boolean | RETRIEVER_LIGHTSHIP_DETECT_KUBERNETES

### How to run

Beforehand, you need an already running dojot instance in your machine. Check out the
[dojot documentation](https://dojotdocs.readthedocs.io)
for more information on installation methods.

Generate the Docker image:

```shell
docker build -t <username>/influxdb-retriever:<tag> -f  .
```

Then the image tagged a `<username>/influxdb-retriever:<tag>` will be made available. You can send it to
your DockerHub registry to made it available for non-local dojot installations:

```shell
docker push <username>/influxdb-retriever:<tag>
```

__NOTE THAT__  you can use the official image provided by dojot in its  [DockerHub page](https://hub.docker.com/r/dojot/influxdb-retriever).

## Documentation

Check the documentation for more information:

- [Latest dojot platform documentation](https://dojotdocs.readthedocs.io/en/latest)
- [Latest api documentation](https:// ) TODO

## Issues and help

If you found a problem or need help, leave an issue in the main
[dojot repository](https://github.com/dojot/dojot) and we will help you!
