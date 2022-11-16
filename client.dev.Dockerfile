FROM node:16

WORKDIR /app

COPY . .

WORKDIR /app/reader

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

WORKDIR /app/server

RUN npm install --legacy-peer-deps

WORKDIR /app/reader

CMD ["npm", "start"]
