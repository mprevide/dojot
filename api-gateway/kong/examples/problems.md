
- Criação de tentants
   - Como configurar os realms?
   - Receber eventos do kafka e fazer chamadas em api ou cli para configurações ou chamada de import????
   -  deixar aquivo disponivel???

   java - json - publica kafka - cliend id client secret


- E o kong?
 - Adicionar apenas na lista global o iss do plugin? Funciona? NÃO
      E pelo visto não há como simplesmente adicionar um na lista, tenho q ter a lista para dar up e o id do plugin
 - escutar eventos de tenants?
 - criar serviço pra subtituir o sh e escutar eventos

- Há como colocar nova key no payload?

- Client podem fazer parte de mais de um realms?

- KEYCLOAK_USER=admin e KEYCLOAK_PASSWORD=admin

- Kong plugin e secrets?
  - como manter? kafka para saber qdo houve nova criação de tenant
        e auto registro para cada tenant?

        é possivel usar regex com um coringa apenas no tenant, porem isso nao ta esta dispoivel no reositŕoio luarocks, apenas no código fonte, foi feito ha um mes
        ???? 
        ai evitaria a criação de mais um serviço

- PKCE nao está sendo usado

- Como se comporta em ambientes difentes de localhost:8000?

-vai ser necessário uma variavel de ambiente q define o dominio por causa dos issuers

- não é possível na importação criar usuários?

```
docker exec -it 9faa25a36205 /opt/jboss/keycloak/bin/standalone.sh -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.file=/tmp/realm3.json -Dkeycloak.migration.usersExportStrategy=SAME_FILE

docker exec -it 9faa25a36205 /opt/jboss/keycloak/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.realmName=admin1 -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.file=/tmp/my_realm2.json

docker cp 9faa25a36205:/tmp/my_realm2.json my_realm3.json

- configurar smtp

- usar clinentid cli?