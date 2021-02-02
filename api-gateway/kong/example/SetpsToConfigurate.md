
# User

- Role Mapping
  -Add as assigned Roles "user"

# Roles

- add novo roles user
- no role admin add user como "Associated Roles"

# Client

- criar novo client kong
  - confidential
  - Standard Flow Enabled
  - Direct Access Grants Enabled
  - Service Accounts Enabled
  - Authorization Enabled
  - Valid Redirect URIs: http://localhost:8000/*
  - na aba Authorization:
    - em Resources:
      - Em create:
        - Name: server-api-example
        - Display name: server-api-example
        - Scopes: view
    - em Permissions:
      - Em create permission Resource based :
        - Name: View server-api-example
        - Apply Policy: user (Should be user)