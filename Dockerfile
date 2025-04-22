FROM node:20-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
WORKDIR /app

# Copiar package.json y otros archivos de configuración
COPY package.json package-lock.json* ./
RUN npm ci

# Reconstrucción del código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3005

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar el código construido
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3005

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]