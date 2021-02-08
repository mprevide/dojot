https://github.com/d4rkstar/kong-konga-keycloak


https://medium.com/@3bit.techs/api-first-from-zero-to-hero-part-3-5ea221b6f131

http://localhost:8000/tss/v1/api-docs


http://localhost:8080/auth/realms/master/.well-known/openid-configuration


http://localhost:8080
http://localhost:1337/#!/info
http://localhost:8000/tss/v1/api-docs/#/devices/findDataFromDevice
http://localhost:8000/tss/v1/devices/1234/data


https://github.com/thomasdarimont/awesome-keycloak#articles

https://docs.google.com/document/d/130aWR8i2R61FwYjmIfnGfvycc91OCwZawbvn-8qiF2E/edit


curl -s -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=demouser" \
        -d "password=demouser" \
        -d 'grant_type=password' \
        -d 'client_id=kong' \
        http://localhost:8080/auth/realms/admin/protocol/openid-connect/token

curl -s -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "response_type=code" \
        -d "username=demouser" \
        -d "password=demouser" \
        -d 'grant_type=password' \
        -d 'client_id=kong' \
        http://localhost:8000/auth/realms/admin/protocol/openid-connect/token


curl -X GET "http://localhost:8000/tss/v1/devices/1234/data?dateFrom=1970-01-01T00:00:00.000Z&dateTo=2025-10-01T20:40:44.000123456Z&limit=256&page=1&order=desc" -H  "accept: application/json" -H  "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhcEdiVUVXM2VLb0U4aWpTMGY1UjNuTXhhRVEydzRuVWN6dER6X2xJem5zIn0.eyJleHAiOjE2MTE3OTQ0MzUsImlhdCI6MTYxMTc5NDEzNSwianRpIjoiOTFmMmY4ODYtMWY5OC00M2I4LTgxOTQtZGJiZjk4N2E4ZGYzIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2F1dGgvcmVhbG1zL2FkbWluIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjQ4YjE3ZmJkLTY3NjktNDE1NS04OGFlLTkyYWMyOGU1ZGY1NCIsInR5cCI6IkJlYXJlciIsImF6cCI6Imd1aSIsInNlc3Npb25fc3RhdGUiOiJkYzAwOTMxZS1jOWExLTRhNTgtODEyMi05YWJiNzFjNDk0MzciLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsInVzZXIiXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImRvam90LW1pY3Jvc2VydmljZXMgcHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJkZW1vdXNlciIsInVzZXJuYW1lIjoiZGVtb3VzZXIifQ.Hz39lsp5eUN9mOXGADmDb-6zo1_nSGy7pCa8_POK754oIiiwwxZMSSUoeqfhJJ582yI_YxocQZgOzMxPUZO4pdZs6fmVWWmaHEYNd9aX5Ft928Y5GaVpMOORzE69E-qxY26ls7GCN-2WXGMLDeARXtsEyn5e9bCjexttg11u65Jt1pwhB8RZn3UIolO9sN9D_Oah1DJo9Jl6zMLBNKV0tfSeqtd7yT4_fh8uQRvfcrWUkAhOuBHDMz46bvIwYT2eE7CdHmJGFOD_mrWuREps-tFkzwaaBmZ1Z75srBQt0IiZ8TswZ-b_kbDzTEJ21YnKwigO5nNQb-KOeeVK7TS8DQ"


curl -s -X GET \
        -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhcEdiVUVXM2VLb0U4aWpTMGY1UjNuTXhhRVEydzRuVWN6dER6X2xJem5zIn0.eyJleHAiOjE2MTE4MzQwMzcsImlhdCI6MTYxMTgzMzczNywianRpIjoiYTZkOGJiOTUtOWI2ZS00MWNiLTllZjktZTYzMWIyMTQ4MWFlIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2F1dGgvcmVhbG1zL2FkbWluIiwic3ViIjoiNDhiMTdmYmQtNjc2OS00MTU1LTg4YWUtOTJhYzI4ZTVkZjU0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWRtaW4tY2xpIiwic2Vzc2lvbl9zdGF0ZSI6IjUxMTUzODczLTI2ZTItNGY5Yy1iMzg4LTE1YmIwNTRhYWNjMCIsImFjciI6IjEiLCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGVtb3VzZXIifQ.IvpR1KJ8ThE9CD7a69y2aV2nMzeSMyOqgM0FACrcUVh7a30fA6ckjTFzsmZ6GmH7EWToooqYGFGRVVAqBNtDthf_espOX7Xhawf_imRch78r6Z2gxAF1tGvgdw6zMFPPmBAIODQ13e49I_7GYbPmFMYPnSqUNfem7LyM60UFK5RUfHXGoXvDLrzYS-IZkfSfuYpJR3kc9zlzck7cj-MUu-JR6nEVV4joktcsRF91y1hvLaepr3-kl-O0t9nukOJgl1jUNi5G3F4Tu1cU2k8vA47Kjjs8hyWwi9UpWJ-ZeAhzRsR4aTSVewM-x_RDRCI9IDx5PJ0IzM1zQwcbVtBenA" \
        -d "username=demouser" \
        -d "password=demouser" \
        -d 'grant_type=password' \
        -d 'client_id=admin-cli' \
        http://localhost:8080/auth/realms/admin/authz/protection/resource_set


http://localhost:8080/auth/realms/admin/authz/protection/resource_set


curl -s -X POST \
        -d "username=demouser" \
        -d "password=demouser" \
        -d 'grant_type=password' \
        -d 'client_id=admin-cli' \
        http://localhost:8000/auth/realms/admin/protocol/openid-connect/token



curl -s -X POST \
        -H "Authorization: Bearer ${JWT}" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
        -d "audience=kong" \
        -d 'permission=device-manager#view' \
        -d 'response_mode=decision' \
        http://localhost:8080/auth/realms/admin/protocol/openid-connect/token


JWT=$(curl --location --request POST localhost:8000/auth/realms/admin/protocol/openid-connect/token \
--data-urlencode 'username=user' \
--data-urlencode 'password=user' \
--data-urlencode 'client_id=admin-cli' \
--data-urlencode 'scope=openid' \
--data-urlencode 'audience=kong' \
--data-urlencode 'grant_type=password' 2>/dev/null | jq -r '.access_token')

JWT=$(curl --location --request POST localhost:8000/auth/realms/admin/protocol/openid-connect/token \
--data-urlencode 'username=user' \
--data-urlencode 'password=user' \
--data-urlencode 'client_id=gui' \
--data-urlencode 'grant_type=password' 2>/dev/null | jq -r '.access_token')


curl -X POST \
  http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
  -H "Authorization: Bearer ${JWT}" \
  --data "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
  --data "audience=kong" \
  --data "response_mode=permissions" \
  --data "permission=device-manager#view"


curl -s -X POST \
        -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhcEdiVUVXM2VLb0U4aWpTMGY1UjNuTXhhRVEydzRuVWN6dER6X2xJem5zIn0.eyJleHAiOjE2MTE4MzM5OTQsImlhdCI6MTYxMTgzMzY5NCwianRpIjoiZjFhNGU5NWYtNGNkOC00MzVlLWExNzItOWUxMmNjYTQ5YzQyIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2F1dGgvcmVhbG1zL2FkbWluIiwic3ViIjoiNDhiMTdmYmQtNjc2OS00MTU1LTg4YWUtOTJhYzI4ZTVkZjU0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWRtaW4tY2xpIiwic2Vzc2lvbl9zdGF0ZSI6IjE3MTE0NjNiLTljMmItNDliZS04ZjU5LWE4YmZmMDhjMTYyNCIsImFjciI6IjEiLCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGVtb3VzZXIifQ.hqiDpI9CUQ36-5uQiZxeUkJqtZ1QNI1UjDjm6htxBKAPJSgP1wVN7Y1LhjMBzjRjXyk8DJmc7Ya1QWJBAef5io6G672lPzaeanq694rExbyyJJooHeS7o_bXt5eUt8xSwGb9H29o9gTKUEN7Xua2fGHQ2Dtzxpjw7KmMKxOpwgqNJCyDMsFzoNr7AuYb0p6JLGcgr-KzVkIeF4mgftSL2k1MZxcHACzkAwEuMZksw2yls4X4IsWtid5QdhJembIar69U2mYg0qpRhBgBZTra-GoBwcn5_2iCMfZjrNHvoCl2DoxD-hpTaGNHO-krH-O7_2ZIWRbamUGDlhUD1FFAWA" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
        -d "audience=kong" \
        -d 'response_mode=permissions' \
        http://localhost:8000/auth/realms/admin/protocol/openid-connect/token


Your Front-end SPA should be public-client and springboot micro service should be Bearer only Client and Gateway could be Confidential Client




https://medium.com/@3bit.techs/api-first-from-zero-to-hero-part-3-5ea221b6f131

http://localhost:8000/tss/v1/api-docs


curl -s -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=demouser" \
        -d "password=demouser" \
        -d 'grant_type=password' \
        -d 'client_id=admin-cli' \
        http://localhost:8000/auth/realms/admin/protocol/openid-connect/token


https://medium.com/@humbertodosreis/keycloak-gerenciando-visibilidade-de-atributos-de-usu%C3%A1rios-9edaa9db51ca

https://ordina-jworks.github.io/security/2019/08/22/Securing-Web-Applications-With-Keycloak.html

https://www.czetsuyatech.com/2019/06/exporting-keycloak-realm-and-users.html