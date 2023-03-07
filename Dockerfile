FROM quay.io/keycloak/keycloak:19.0

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

USER root

RUN microdnf update -y
#RUN curl -O https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tgz
#RUN tar xvzf Python-2.7.18.tgz
#
#
#RUN microdnf install -y gcc zlib-devel openssl-devel curl
#RUN ./configure --prefix=/opt/python2 --with-optimizations
#RUN make
#RUN make install
#RUN export PATH=/opt/python2/bin:$PATH
# RUN microdnf install -y wget
# RUN wget https://github.com/niess/python-appimage/releases/download/python2.7/python2.7.18-cp27-cp27m-manylinux1_x86_64.AppImage
# RUN install -m 755 python2.7.18-cp27-cp27m-manylinux1_x86_64.AppImage /usr/local/bin/
# RUN ln -sr /usr/local/bin/python2.7.18-cp27-cp27m-manylinux1_x86_64.AppImage /usr/local/bin/python2


RUN curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
RUN microdnf install -y python2
RUN microdnf install -y git
RUN microdnf install -y gcc-c++ gcc make
RUN microdnf clean all

#NodeJS START
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

#NodeJS END
WORKDIR /app

RUN chmod +x *.sh

ENTRYPOINT ["bash", "./docker-entrypoint.sh" ]
## ENTRYPOINT ["node", "--version" ]
