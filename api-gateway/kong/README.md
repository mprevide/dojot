# Kong

## Kong's authorization layer

The [Kong Microservice API Gateway](https://konghq.com/solutions/gateway/) was extended by dojot in order to perform authorization task, it was done by adding two plugins: [jwt-keycloak](https://github.com/gbbirkisson/kong-plugin-jwt-keycloak) and PEPKong.

The jwt-keycloak is responsible for offline taks like validate token signature and `exp` claim.

The PEPKong is responsible for online validations using Keycloak authorization service.

![Component architecture](./kong-authz-architecture.png?raw=true)
