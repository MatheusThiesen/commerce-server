FROM node:latest

WORKDIR /usr/src/commerce-server
COPY package*.json ./
RUN yarn 
#install --production
# RUN npm install 
# --only=prod --omit=dev

# Bundle app source
COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 4444

CMD ["npm","run", "start:prod"]
