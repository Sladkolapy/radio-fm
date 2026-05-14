# PingMusic / my_music_player

Музыкальный плеер с локальным хранением аудио, обложек и метаданных. Backend работает на Node.js + Express + SQLite, frontend — на React + TypeScript + Vite.

## Как запустить

### Вариант 1: локально для разработки

Нужен Node.js 18+ и npm.

Установить зависимости из корня проекта:

```bash
./setup.sh
```

Если `setup.sh` не нужен, можно вручную:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Запустить backend в первом терминале:

```bash
cd backend
npm run dev
```

Backend будет доступен на `http://localhost:3000`.

Запустить frontend во втором терминале:

```bash
cd frontend
npm run dev
```

Frontend будет доступен на `http://localhost:5173`.

Открывать приложение нужно здесь:

```text
http://localhost:5173
```

Vite сам проксирует `/api` и `/uploads` на backend. Если backend запущен не на `localhost:3000`, задайте:

```bash
VITE_DEV_API_TARGET=http://localhost:3001 npm run dev
```

### Вариант 2: через Docker Compose для разработки

Из корня проекта:

```bash
docker compose up --build
```

После запуска:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`
- health check: `http://localhost:3000/health`

В `docker-compose.yml` backend и frontend запускаются отдельными сервисами, а frontend ходит к backend по `http://backend:3000`.

### Вариант 3: production одним Express-сервером

Собрать frontend:

```bash
cd frontend
npm ci
npm run build
```

Запустить backend в production:

```bash
cd ../backend
JWT_SECRET=change-me NODE_ENV=production npm start
```

Приложение будет доступно на backend-порту:

```text
http://localhost:3000
```

В production Express отдаёт API и собранный frontend из `frontend/dist`.

### Вариант 4: production через Docker Compose

Создайте `.env` в корне проекта:

```env
JWT_SECRET=change-me-to-a-long-random-secret
PORT=3000
```

Запустите:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Открывайте:

```text
http://localhost:3000
```

Данные production-контейнера хранятся в Docker volumes:

- `music_db`
- `music_uploads`

## Первый вход

При старте backend создаёт администратора, если его ещё нет:

- логин: `admin`
- пароль: `admin123`

Можно переопределить через переменные:

```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=strong-password npm start
```

Для обычного пользователя можно зарегистрироваться через кнопку `Sign Up` в интерфейсе.

## Переменные окружения

Backend:

- `PORT` — порт backend, по умолчанию `3000`.
- `NODE_ENV=production` — включает раздачу `frontend/dist` из Express.
- `JWT_SECRET` — секрет подписи JWT. Для production обязателен.
- `JWT_EXPIRES_IN` — срок жизни JWT, по умолчанию `7d`.
- `ADMIN_USERNAME` — логин seed-админа, по умолчанию `admin`.
- `ADMIN_PASSWORD` — пароль seed-админа, по умолчанию `admin123`.

Frontend dev:

- `VITE_DEV_API_TARGET` — backend target для Vite proxy, по умолчанию `http://localhost:3000`.

## Проверка, что всё работает

Backend:

```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:

```json
{"status":"ok","timestamp":"..."}
```

Frontend:

```text
http://localhost:5173
```

Для production:

```text
http://localhost:3000
```

## Тесты

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

Сборка frontend:

```bash
cd frontend
npm run build
```

## Что умеет приложение

- Регистрация и вход через JWT.
- Роли `user` и `admin`.
- Просмотр музыкальной библиотеки.
- Загрузка аудио и обложек.
- Создание, редактирование и удаление треков.
- Теги и фильтрация по тегам.
- Настроения треков: `focus`, `energy`, `calm`, `motivation`, `relax`.
- Админ-панель для управления всеми треками и тегами.
- Offline-сохранение аудио в браузере через Cache Storage/service worker.

## Структура проекта

```text
my_music_player/
├── backend/
│   ├── server.js              # Express entrypoint
│   ├── config/                # SQLite и Multer
│   ├── controllers/           # auth/tracks/tags
│   ├── middleware/            # JWT и admin middleware
│   ├── routes/                # API routes
│   ├── tests/                 # Jest/Supertest
│   ├── database/              # SQLite database
│   └── uploads/               # audio/covers
├── frontend/
│   ├── src/
│   │   ├── pages/             # страницы
│   │   ├── features/          # auth/music/admin
│   │   ├── shared/            # API, UI, types, lib
│   │   ├── store/             # Redux store
│   │   └── styles/            # CSS/Tailwind
│   ├── public/service-worker.js
│   └── vite.config.ts
├── docs/PROJECT.md            # подробная карта проекта
├── API_DOCUMENTATION.md       # подробное API
├── QUICK_START.md             # короткий старт
├── docker-compose.yml         # dev compose
└── docker-compose.prod.yml    # prod compose
```

## API кратко

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

Tracks:

- `GET /api/tracks`
- `GET /api/tracks/:id`
- `GET /api/tracks/private`
- `POST /api/tracks`
- `PUT /api/tracks/:id`
- `DELETE /api/tracks/:id`
- `GET /api/admin/tracks`

Tags:

- `GET /api/tags`
- `GET /api/tags/:id/tracks`
- `POST /api/tags`
- `PUT /api/tags/:id`
- `DELETE /api/tags/:id`

Подробности: `API_DOCUMENTATION.md`.

## Важные файлы данных

Для backup нужны:

- `backend/database`
- `backend/uploads`

В Docker production им соответствуют volumes `music_db` и `music_uploads`.

## Документация

- `docs/PROJECT.md` — подробное описание архитектуры и устройства проекта.
- `QUICK_START.md` — быстрый старт.
- `API_DOCUMENTATION.md` — API reference.

## Лицензия

MIT
