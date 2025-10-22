# Etapa 1: Construcción de la aplicación
FROM node:22 AS builder

WORKDIR /app

# Copiar archivos esenciales
COPY package*.json prisma ./

# Instalar dependencias
RUN rm -rf node_modules package-lock.json
RUN npm install -g @nestjs/cli
RUN npm install --legacy-peer-deps

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build:all

# Etapa 2: Imagen final con OpenSSL instalado
FROM node:22-slim

WORKDIR /app

# 🔥 Dependencias necesarias para Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Variables para Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/apps/jjvsolution-back-mp/main"]