FROM node:16

WORKDIR /app

COPY . .

WORKDIR /app/server

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

CMD ["npm", "run", "watch"]
