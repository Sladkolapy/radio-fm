FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app
RUN mkdir -p database uploads/audio uploads/covers

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY --from=frontend-builder /build/dist /frontend/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
