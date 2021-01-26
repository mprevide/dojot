http://localhost:8080/auth/realms/master/.well-known/openid-configuration




  - docker-compose up -d keycloak
  
entrar em http://localhost:8080/

- create a client publico e copiar o cliend id KONG_CLIENT_ID 
 - client id = kong
 - Client Protocol = openid-connect
 - root url = http://localhost:8000/
 - enable on
 - access type = public
 - standard flow enable on
 - direct access Grants enable on
 - valid redirect uris http://localhost:8000/*

 Tab installation:

  - Keycloack OID JSON
  - copiar 


- docker-compose up -d

