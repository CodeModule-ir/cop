FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --verbose
COPY . .
RUN npm run build --verbose
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
