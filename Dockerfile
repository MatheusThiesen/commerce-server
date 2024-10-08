FROM node:20-alpine

WORKDIR /usr/src/commerce-server
COPY package*.json ./
RUN yarn 
#install --production
# RUN npm install 
# --only=prod --omit=dev

# Bundle app source
COPY . .

RUN npx prisma generate
RUN yarn build

EXPOSE 4444


CMD ["node","/usr/src/commerce-server/dist/src/main"]
