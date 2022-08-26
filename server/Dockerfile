FROM node:16
WORKDIR /serverapp

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3001

CMD ["npm","start"]