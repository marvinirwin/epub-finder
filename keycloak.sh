

sudo docker run \
-d \
-p 8080:8080 \
-e KEYCLOAK_USER=$KEYCLOAK_USER \
-e KEYCLOAK_PASSWORD=KEYCLOAK_PASSWORD  \
-e DB_USER=$DB_USER \
-e DB_PASSWORD=$DB_PASSWORD \
-e DB_ADDR=$DB_ADDR \
-e DB_VENDOR=POSTGRES \
-e PROXY_ADDRESS_FORWARDING=true \
quay.io/keycloak/keycloak:12.0.2

# Create Realm LanguageTrainer
