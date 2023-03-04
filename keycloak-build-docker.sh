#/bin/zsh

VERSION=14.0.0 # set version here

cd /tmp
git clone https://github.com/keycloak/keycloak-containers.git
cd keycloak-containers/server
git checkout $VERSION
docker build -t "jboss/keycloak:${VERSION}" .
docker build -t "quay.io/keycloak/keycloak:${VERSION}" .

docker tag keycloak:latest marvinirwin/keycloak:latest
docker push marvinirwin/keycloak:latest
