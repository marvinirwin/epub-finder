FROM node:16

WORKDIR /app

COPY . .

# Install and build the reader
WORKDIR /app/reader

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

WORKDIR /app/server

RUN npm install --legacy-peer-deps

RUN npm run build

# Build and run the server
WORKDIR /app/server

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

RUN npm run build

CMD ["npm", "run", "start"]
