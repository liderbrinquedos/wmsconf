FROM node:18-alpine

# Instalar Python e ferramentas de build para o bcrypt
RUN apk add --no-cache python3 py3-pip build-base python3-dev
RUN pip3 install --break-system-packages bcrypt

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]