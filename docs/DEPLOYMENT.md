# Запуск и деплой

## Development локально

Нужен Node.js 18+ и npm.

Установить зависимости:

```bash
./setup.sh
```

Или вручную:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Запустить backend:

```bash
cd backend
npm run dev
```

Запустить frontend:

```bash
cd frontend
npm run dev
```

Адреса:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`
- health check: `http://localhost:3000/health`

## Development через Docker Compose

```bash
docker compose up --build
```

Сервисы:

- `backend` — порт `3000`;
- `frontend` — порт `5173`.

Frontend внутри Docker ходит к backend через `VITE_DEV_API_TARGET=http://backend:3000`.

## Production без Docker

Собрать frontend:

```bash
cd frontend
npm ci
npm run build
```

Запустить backend:

```bash
cd ../backend
JWT_SECRET=change-me NODE_ENV=production npm start
```

Приложение будет доступно на backend-порту, по умолчанию `http://localhost:3000`.

При `NODE_ENV=production` Express отдаёт:

- API по `/api`;
- загруженные файлы по `/uploads`;
- frontend build из `../frontend/dist`.

## Production через Docker Compose

Создать `.env` в корне проекта:

```env
JWT_SECRET=change-me-to-a-long-random-secret
PORT=3000
```

Запустить:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Открывать:

```text
http://localhost:3000
```

## Переменные окружения

Backend:

- `PORT` — порт Express, по умолчанию `3000`.
- `NODE_ENV` — `production` включает раздачу `frontend/dist`.
- `JWT_SECRET` — секрет подписи JWT, обязателен для production.
- `JWT_EXPIRES_IN` — срок жизни JWT, по умолчанию `7d`.
- `ADMIN_USERNAME` — seed admin username, по умолчанию `admin`.
- `ADMIN_PASSWORD` — seed admin password, по умолчанию `admin123`.

Frontend/dev:

- `VITE_DEV_API_TARGET` — backend target для Vite proxy, по умолчанию `http://localhost:3000`.

## Первый вход

Seed admin:

- username: `admin`
- password: `admin123`

Для production лучше переопределить `ADMIN_USERNAME` и `ADMIN_PASSWORD`.

## Backup

Для backup нужны:

- `backend/database`
- `backend/uploads`

В Docker production им соответствуют volumes:

- `music_db` -> `/app/database`
- `music_uploads` -> `/app/uploads`
