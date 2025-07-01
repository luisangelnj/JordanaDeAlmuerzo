# Dockerfile simple para desarrollo
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiamos todo para tener una base, pero el volumen lo sobreescribirá
COPY . .

# El puerto que expone tu API de Express
EXPOSE 3001

# El comando por defecto que se ejecutará
CMD ["npm", "run", "dev"]