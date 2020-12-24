FROM node:14

RUN echo "deb http://ftp.de.debian.org/debian sid main" >> /etc/apt/sources.list && \
    apt-get -qqy update && \
    apt-get -qqy install pdf2htmlex && \
    apt-get -qqy install nginx && \
    rm -rf /var/lib/apt/lists/*;


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .


# TODO favicons and other stuff, I should just bundle that stuff in the image
VOLUME [
    "/pronunciation-videos",
    "/uploaded-documents",
    "/built-in-documenst"
]


EXPOSE 3000






