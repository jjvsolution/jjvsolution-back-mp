# Etapa 1: Construcción de la aplicación
FROM node:22 AS builder

WORKDIR /app

# Copiar archivos esenciales
COPY package*.json prisma ./

# Instalar dependencias
RUN rm -rf node_modules package-lock.json
RUN npm install -g @nestjs/cli
RUN npm install

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build:all

# Etapa 2: Imagen final con OpenSSL instalado
FROM node:22-alpine

WORKDIR /app

# 🔥 Instalar OpenSSL correctamente en Alpine
# RUN apk add --no-cache openssl
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont
# RUN apk add --no-cache openssl nginx

# Variables de entorno
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    CHROMIUM_PATH=/usr/bin/chromium-browser

# Copiar archivos necesarios
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
#COPY --from=builder /app/.env .env

# Configuración de Nginx
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto de la aplicación
#EXPOSE 80 443
EXPOSE 3000
 
# CMD ["sh", "-c", "nginx && node dist/apps/graphql/main"]
CMD ["node", "dist/apps/jjvsolution-back-mp/main"]