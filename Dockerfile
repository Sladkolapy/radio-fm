FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app

# Pull frontend artifact first so this stage waits for frontend-builder to finish entirely.
# Without this, BuildKit runs frontend `npm ci` and backend `npm ci` in parallel (high RAM).
COPY --from=frontend-builder /build/dist /frontend/dist

RUN mkdir -p database uploads/audio uploads/covers

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
