#/bin/zsh


cd /tmp
git clone https://github.com/keycloak/keycloak
cd keycloak/server
docker build -t "keycloak:latest" .

docker tag keycloak:latest marvinirwin/keycloak2:latest
docker push marvinirwin/keycloak2:latest
