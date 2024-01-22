
# Base image
FROM node:latest
# FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npx prisma generate
RUN npm run build

# PORT 4444
EXPOSE 4444

# Start the server using the production build
CMD [ "node", "dist/main.js" ]