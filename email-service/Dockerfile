FROM node:20-alpine

WORKDIR /app

COPY shared /shared
COPY email-service/package*.json ./
RUN npm install --production

COPY email-service/src ./src
COPY email-service/.env.example ./.env

EXPOSE 3003
CMD ["npm", "start"]
