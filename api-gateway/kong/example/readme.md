



http://localhost:8080
http://localhost:1337/#!/info
http://localhost:8000/tss/v1/api-docs/#/devices/findDataFromDevice
http://localhost:8000/tss/v1/devices/1234/data

  - docker-compose up -d keycloak

entrar em http://localhost:8080/

- create a client publico e copiar o cliend id KONG_CLIENT_ID
 - client id = kong
 - Client Protocol = openid-connect
 - root url = http://localhost:8000/ or apigw:8000? 
 - enable on
 - access type = public
 - standard flow enable on
 - direct access Grants enable on
 - valid redirect uris http://localhost:8000/*


By adding a client, we're basically telling Keycloak that it's ok that this particular device to interact with it. Any application that is dealing with authentication on behalf of the user is considered to be a client to Keycloak.

 Tab installation:

  - Keycloack OID JSON
  - copiar 


- docker-compose up -d



---


Roles are used to categorize the user. In an application, the permission to access resources is often granted to the role rather than the user. Admin, User, and Manager are all typical roles that may exist in an organization.
To create a role, click the “Roles” menu on the left followed by the “Add Role” button on the page.


This plugin interact with Keycloak through [Authorization Service Endpoint](https://www.keycloak.org/docs/latest/authorization_services/#_service_authorization_api),
while this plugin is the PEP (Policy Enforcment Point) and Keycloak is the PDP (Policy Decision Point).

### HTTPS
It's highly recommended to communicate with Keycloak over HTTPS, visit the session **Setting up TLS(SSL)** in [Keycloak Docker image page](https://hub.docker.com/r/jboss/keycloak/) for more details.


## Kafka integration
To test Kafka integration follow these instructions:

- Get an admin token:
```

ADMIN_JWT=$(curl --location --request POST localhost:8000/auth/realms/admin/protocol/openid-connect/token \
--data-urlencode 'username=admin' \
--data-urlencode 'password=admin' \
--data-urlencode 'client_id=admin-cli' \
--data-urlencode 'grant_type=password' 2>/dev/null | jq -r '.access_token')

```

- Create a new tenant:
```
curl --location --request POST 'http://localhost:8080/auth/admin/realms' -H "Authorization: Bearer ${ADMIN_JWT}" -H 'Content-Type:application/json' \
--data-raw ' {
   "realm": "myTenant",
   "displayName": "myTenant",
   "enabled": true
 }'
``` 

- Delete tenant:
```
curl --location --request DELETE 'http://localhost:8080/auth/admin/realms/myTenant' -H "Authorization: Bearer ${ADMIN_JWT}" -H 'Content-Type:application/json'
 ```


  
Usuario 

 - admin -> roles: admin, offline_acess, uma_auhtorization
 - user - > roles: user, offline_acess, uma_auhtorization
 
Roles

 - admin -> Associetad Roles: User
 - user

Client Scopes - adiciona informações no token 

dojot-microservices

---
 Roles
 
admin	
offline_access	
uma_authorization
user <-


Client Scopes


address	
dojot-microservices	 X
email	
microprofile-jwt	
offline_access	
phone	
profile	
role_list	
roles
web-origins


Clients


account	
account-console	
admin-cli	
broker	 
gui	 X 
kong	 X 
realm-management  X 	


in client kong add authorization in resource 
          {
            "name": "device-manager",
            "ownerManagedAccess": false,
            "displayName": "Device Manager",
            "attributes": {},
            "_id": "3b1d1a99-4549-44d0-86f8-91848dae9e38",
            "uris": [],
            "scopes": [
              {
                "name": "view"
              },
              {
                "name": "update"
              },
              {
                "name": "delete"
              },
              {
                "name": "create"
              }
            ]
          },

e em permissos

          {
            "id": "af3ed201-6153-4668-872a-9cf58d55ae35",
            "name": "All templates and devices",
            "type": "scope",
            "logic": "POSITIVE",
            "decisionStrategy": "UNANIMOUS",
            "config": {
              "resources": "[\"device-manager\"]",
              "scopes": "[\"update\",\"delete\",\"create\",\"view\"]",
              "applyPolicies": "[\"Should be user\"]"
            }
          }