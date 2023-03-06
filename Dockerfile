FROM marvinirwin/keycloak2:latest

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

USER root

RUN microdnf update -y
RUN microdnf install -y yum
RUN curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
RUN microdnf install -y nodejs
RUN microdnf install git
RUN microdnf install python2 gcc-c++ gcc make
RUN microdnf clean all



# NodeJS START
WORKDIR /app

COPY ./reader/package.json ./reader/package.json
COPY ./reader/package-lock.json ./reader/package-lock.json

COPY ./server/package.json ./server/package.json
COPY ./server/package-lock.json ./server/package-lock.json

WORKDIR /app/reader

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

WORKDIR /app/server

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

WORKDIR /app

COPY . .

WORKDIR /app/reader

RUN npm run build

WORKDIR /app/server

RUN npm run build

# NodeJS END
WORKDIR /app

RUN chmod +x *.sh

ENTRYPOINT ["bash", "./docker-entrypoint.sh" ]
# ENTRYPOINT ["node", "--version" ]
