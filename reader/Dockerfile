FROM node:16

WORKDIR /app

COPY . .

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

CMD ["npm", "start"]