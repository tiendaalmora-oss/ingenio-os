# Usa una imagen oficial de Node.js ligera
FROM node:20.20.2-alpine AS builder

WORKDIR /app

# Copia los archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas las dependencias
RUN npm ci

# Copia el código fuente
COPY . .

# Genera Prisma
RUN npx prisma generate

# Construye la aplicación Next.js
RUN npm run build

# Imagen de producción
FROM node:20.20.2-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copia las dependencias de producción, la carpeta .next y demás archivos estáticos
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Ejecuta el servidor standalone de Next.js
CMD ["node", "server.js"]
