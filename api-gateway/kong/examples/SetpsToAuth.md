JWT=$(curl --location --request POST localhost:8080/auth/realms/admin/protocol/openid-connect/token \
--data-urlencode 'username=admin' \
--data-urlencode 'password=admin' \
--data-urlencode 'client_id=admin-cli' \
--data-urlencode 'grant_type=password' 2>/dev/null | jq -r '.access_token')

echo $JWT

curl -X GET "http://localhost:8000/secure" -H  "accept: application/json" -H  "Authorization: Bearer ${JWT}"


curl -X GET "http://localhost:8000/insecure"