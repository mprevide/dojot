
# User

-Email Verified on
-Set passowrd as NOT temporary
- Role Mapping
  -Add as assigned Roles "user"

# Roles

- add novo roles 'user'
- no role admin add 'user' como "Associated Roles"

# Client
- roles
  uma_protection

- criar novo client 'kong'
  - Enabled ON
  - confidential
  - Standard Flow Enabled
  - Direct Access Grants Enabled
  - Service Accounts Enabled
  - Authorization Enabled
  - Valid Redirect URIs: http://localhost:8000/*
  - na aba Authorization:
    - em Authorization Scopes:
      - Add: create, delete, update, view
    - em Polices:
        Criar Role:
         - Should be admin
           Realm Roles: admin (checar Required)
         - Should be user
           Realm Roles: user (checar Required)
    - em Resources:
      - Em create:
        - Name: server-api-example-sec
        - Display name: server api example sec
        - Scopes: view
        User-Managed Access Enabled ???
    - em Permissions:
      - Em create permission Scope based :
        - Name: View server-api-example-sec
        - Resources: server-api-example-sec
        - Scopes: view
        - Apply Policy: Should be user
        - Decision Strategy  UNnaminous


- criar novo client 'cli'
  - Enabled  on
  - public
  - Standard Flow Enabled  off
  - Direct Access Grants Enabled
  - scope: add user


JWT=$(curl --location --request POST localhost:8000/auth/realms/admin/protocol/openid-connect/token \
--data-urlencode 'username=user' \
--data-urlencode 'password=user' \
--data-urlencode 'client_id=admin-cli' \
--data-urlencode 'grant_type=password' 2>/dev/null | jq -r '.access_token')


curl -X POST \
  http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
  -H "Authorization: Bearer ${JWT}" \
  --data "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
  --data "audience=kong" \
  --data "response_mode=permissions" \
  --data "permission=device-manager#view"

