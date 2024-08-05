FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --verbose
COPY . .
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
