FROM node:latest
WORKDIR /usr/src/commerce-server
COPY package*.json ./
RUN npm install 
# RUN npm install --only=prod

# Bundle app source
COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy
RUN npm run build

EXPOSE 4444

CMD ["npm","run", "start:prod"]
