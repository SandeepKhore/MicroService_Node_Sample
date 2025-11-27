FROM node:20-alpine

WORKDIR /app

COPY shared /shared
COPY auth-service/package*.json ./
RUN npm install --production

COPY auth-service/src ./src
COPY auth-service/.env.example ./.env

EXPOSE 3001
CMD ["npm", "start"]
