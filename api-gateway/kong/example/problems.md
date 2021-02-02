
- Criação de tentants
   - Como configurar os realms?
   - Receber eventos do kafka e fazer chamadas em api ou cli para configurações ou chamada de import????
   -  deixar aquivo disponivel???

- E o kong?
 - Adicionar apenas na lista global o iss do plugin? Funciona?
 - escutar eventos de tenants? 

- Há como colocar nova key no payload?

- Client podem fazer parte de mais de um realms?

- KEYCLOAK_USER=admin e KEYCLOAK_PASSWORD=admin

- Kong plugin e secrets?
  - como manter? kafka para saber qdo houve nova criação de tenant
        e auto registro para cada tenant?

- PKCE nao está sendo usado

- Como se comporta em ambientes difentes de localhost:8000?

- não é possível na importação criar usuários?

```
docker exec -it fd30e1498a7e /opt/jboss/keycloak/bin/standalone.sh -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.file=/tmp/realm2.json -Dkeycloak.migration.usersExportStrategy=SAME_FILE

docker exec -it fd30e1498a7e /opt/jboss/keycloak/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.realmName=admin -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.file=/tmp/my_realm2.json

docker cp fd30e1498a7e:/tmp/my_realm2.json my_realm.json

- configurar smtp