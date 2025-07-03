# ----- Etapa 1: Builder -----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ----- Etapa 2: Production -----
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start"]