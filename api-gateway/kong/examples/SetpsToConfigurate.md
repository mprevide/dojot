# Configurações básicas

Acesse http://localhost:8080/

Logue-se com `admin` e `admin`  (KEYCLOAK_USER KEYCLOAK_PASSWORD)

Crie um novo realm chamado `admin`

## Roles

- Crie um novo Role com o nome 'user'

- Crie um novo Role com o nome 'admin'
  - Habilite a opção `Composite Roles`
  - Em `Available Roles` selecione `user`  e `Add selected` , de modo que `user` estará listado em `Associated Roles` .

## User

- Criei um novo usuário com username `admin` que terá  o *role* `admin`
  - Habilite a opção `Email Verified` (Apenas para teste local)
  - Vá para a aba `Credentials`
    - Definia uma senha e a confirme em `Password` e `Password Confirmation`, no exemplo é utilizado a senha `user`  (Apenas para teste local)
    - Habilite a opção `Temporary`  (Apenas para teste local)
  - Vá para a aba `Role Mappings`
    - Em `Available Roles` selecione `admin`  e `Add selected` , de modo que `admin` estará listado em `Associated Roles` .

- Criei um novo usuário com username `user` que terá  o *role* `user`
  - Habilite a opção `Email Verified` (Apenas para teste local)
  - Vá para a aba `Credentials`
    - Definia uma senha e a confirme em `Password` e `Password Confirmation` , no exemplo é utilizado a senha `admin`  (Apenas para teste local)
    - Habilite a opção `Temporary`  (Apenas para teste local)
  - Vá para a aba `Role Mappings`
    - Em `Available Roles` selecione `user`  e `Add selected` , de modo que `user` estará listado em `Associated Roles` .

## Clients

- Crie um novo `client`com o *Client ID* como `kong`
  - Habilite a opção `Enable` caso não esteja habilitada
  - Defina `Client Protocol` como `openid-connect`
  - Defina `Access Type` como `confidential`
  - Habilite a opção `Standard Flow Enabled` caso não esteja habilitada
  - Dehabilite a opção `Implicit Flow Enabled` caso esteja habilitada
  - Habilite a opção `Direct Access Grants Enabled` caso não esteja habilitada
  - Habilite a opção `Service Accounts Enabled` caso não esteja habilitada (Checar se é necessária)
  - Habilite a opção `Authorization Enabled` caso não esteja habilitada (Checar se é necessária)
  - Defina `Valid Redirect URIs` como `http://localhost:8000/*`
  - Vá para a aba `Authorization`
    - Dentro de `Authorization` selecione a aba `Authorization Scopes`
      - Crie os seguintes scopes: `create`, `delete`, `update` e  `view`. **Atenção, aqui a ideia é utilizar `create` para**POST**,  `delete` para**DELETE**,    `update` para**PUT**ou**PATCH**e `view` para**GET**.
    - Dentro de `Authorization` selecione a aba `Polices`
      - Crie uma politica para role `admin`
        - Em `Create Policy` selecione `role`
          - Defina como name `Should be admin`
          - Defina em `Realm Roles` o valor `admin` e selecione como `Required` (Checar se é necessário? )
          - Defina `Logic`como `Positive`
      - Crie uma politica para role `user`
        - Em `Create Policy` selecione `role`
          - Defina como name `Should be user`
          - Defina em `Realm Roles` o valor `user` e selecione como `Required` (Checar se é necessário? )
          - Defina `Logic`como `Positive`
    - Dentro de `Authorization` selecione a aba `Resources`
      - Crie um novo recurso para o exemplo "server-api-example-sec"
        - Defina o `name` como `server-api-example-sec` **Atenção, no nosso caso de exemplo esse `name` deve ser o mesmo `name`que foi dado ao criar o `service` no `kong`.**
        - Defina algum valor significativo para identificar em `Display name`, neste caos algo como `Server Api Example with security`
        - Em `scopes` defina os valores `create`, `delete`, `update` e  `view`
        - Habilitar `User-Managed Access Enabled` (Checar ???)
        - Clique em save
    - Dentro de `Authorization` selecione a aba `Permissions`
      - Em `Create Permission` selecione `Scope-based`
        - Defina um `name` significativo como neste caso `Modifications Server Api Example with security`
        - Em `resource` defina `server-api-example-sec`
        - Em `scopes` defina os valores `create`, `delete`  e `update`
        - Em `Apply Policy` defina `Should be admin`
        - Em `Decision Strategy`  deixe `Unanomous`
      - Em `Create Permission` selecione `Scope-based`
        - Defina um `name` significativo como neste caso `View Server Api Example with  security`
        - Em `resource` defina `server-api-example-sec`
        - Em `scopes` defina os valores `view`
        - Em `Apply Policy` defina `Should be user`
        - Em `Decision Strategy`  deixe `Unanomous`

- Crie um novo `client`com o *Client ID* como `kong`
  - Habilite a opção `Enable` caso não esteja habilitada
  - Defina `Client Protocol` como `openid-connect`
  - Defina `Access Type` como `public`
  - Dehabilite a opção `Standard Flow Enabled` caso  esteja habilitada
  - Dehabilite a opção `Implicit Flow Enabled` caso esteja habilitada
  - Habilite a opção `Direct Access Grants Enabled` caso não esteja habilitada
  - Vá para a aba `Scope`
    - Habilite `Full Scope Allowed` ou selecione o `scope` `user`

## Checar configurações

```sh
JWT=$(curl --location --request POST http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
--data-urlencode 'username=admin' \
--data-urlencode 'password=admin' \
--data-urlencode 'client_id=gui' \
--data-urlencode 'grant_type=password' 2>/dev/null | jq -r '.refresh_token')
```

```sh
curl -X POST \
  http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
  --data "grant_type=refresh_token" \
  --data "client_id=gui" \
  --data "refresh_token=${JWT}"
```

```sh
echo $JWT
```

```sh
curl -X POST \
  http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
  -H "Authorization: Bearer ${JWT}" \
  --data "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
  --data "audience=kong" \
  --data "response_mode=permissions" \
  --data "permission=server-api-example-sec#view"
```

```sh
curl -X GET "http://localhost:8000/secure" -H  "Authorization: Bearer ${JWT}"
```

```sh
curl -X DELETE "http://localhost:8000/secure" -H  "Authorization: Bearer ${JWT}"
```

```sh
curl -X GET "http://localhost:8000/insecure"
```
