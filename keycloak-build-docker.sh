#/bin/zsh

VERSION=14.0.0 # set version here

cd /tmp
git clone https://github.com/keycloak/keycloak-containers.git
cd keycloak-containers/server
git checkout $VERSION
docker build -t "keycloak:latest" .

docker tag keycloak:latest marvinirwin/keycloak2:latest
docker push marvinirwin/keycloak2:latest
