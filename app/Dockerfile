# Stage 1 - Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Stage 2 - Production
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs server.js .
COPY --chown=nodeuser:nodejs package.json .
USER nodeuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]