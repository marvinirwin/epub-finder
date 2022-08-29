FROM node:15-alpine

WORKDIR /app

COPY . .

RUN npm cache clean --force

RUN apk add --no-cache --virtual .gyp \
        py3-pip \
        make \
        g++ \
        git \
    && npm install --legacy-peer-deps --build-from-source \
    && apk del .gyp;

RUN npm run build;

CMD ["npm", "start"]
