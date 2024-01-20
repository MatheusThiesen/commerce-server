FROM node:alpine

RUN mkdir -p /usr/src/commerce-server
WORKDIR /usr/src/commerce-server

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 4444

CMD ["npm","run", "start:prod"]
