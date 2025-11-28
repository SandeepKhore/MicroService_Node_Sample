FROM node:20-alpine

WORKDIR /app

COPY shared ./shared
COPY notification-service/package*.json ./
RUN npm install --production

COPY notification-service/src ./src
COPY notification-service/.env.example ./.env

EXPOSE 3002
CMD ["npm", "start"]
