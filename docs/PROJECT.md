# Проект: my_music_player / PingMusic

`my_music_player` — full-stack веб-приложение для собственной музыкальной библиотеки. Оно хранит аудио, обложки и метаданные локально на сервере: файлы лежат в `backend/uploads`, данные — в SQLite (`backend/database/music.db`).

Проект рассчитан на личное или небольшое self-hosted развёртывание: пользователь регистрируется, загружает треки, назначает настроение и теги, слушает музыку через браузер и может сохранять треки для offline-прослушивания в конкретном браузере.

## Что уже есть

- Регистрация, вход и проверка профиля через JWT.
- Роли `user` и `admin`.
- Публичная библиотека треков: список, карточки, обложки, теги, настроение.
- Загрузка трека авторизованным пользователем: аудио обязательно, обложка опциональна.
- Редактирование и удаление трека владельцем или администратором.
- Админ-панель для просмотра всех треков и управления тегами.
- Фильтрация треков по тегам и API-фильтры по `tag_id` / `mood_type`.
- Offline-кэш аудио через Cache Storage и service worker в production.
- Docker-конфиги для development и production.
- Backend-тесты на Jest/Supertest и frontend-тесты на Vitest.

## Технологии

| Слой | Стек |
| --- | --- |
| Backend | Node.js, Express, SQLite3, JWT, bcrypt, Multer, CORS |
| Frontend | React 18, TypeScript, Vite, Redux Toolkit, React Router, Axios, Tailwind CSS, Zustand |
| Тесты | Jest + Supertest на backend, Vitest + Testing Library на frontend |
| Запуск | npm scripts, Docker Compose |

## Быстрый запуск

Установка зависимостей:

```bash
./setup.sh
```

Development запускается двумя процессами:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Адреса по умолчанию:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

В dev-режиме Vite проксирует `/api` и `/uploads` на backend. Цель прокси задаётся через `VITE_DEV_API_TARGET`, по умолчанию `http://localhost:3000`.

## Production

В production один Express-процесс может отдавать и API, и собранный frontend:

```bash
cd frontend
npm ci
npm run build

cd ../backend
NODE_ENV=production npm start
```

При `NODE_ENV=production` backend раздаёт `../frontend/dist` и fallback на `index.html` для SPA-маршрутов.

Production Docker Compose находится в `docker-compose.prod.yml`. Он собирает корневой `Dockerfile`, публикует порт `${PORT:-3000}:3000` и хранит данные в volume:

- `music_db` -> `/app/database`
- `music_uploads` -> `/app/uploads`

Для production обязательно задать `JWT_SECRET`.

## Структура репозитория

```text
.
├── backend/                  # Express API, SQLite, загрузка файлов
│   ├── config/
│   │   ├── db.js             # схема БД, seed admin/tags/sample tracks
│   │   └── storage.js        # Multer storage/filter/limits
│   ├── controllers/          # auth, tracks, tags
│   ├── middleware/           # JWT auth/admin middleware
│   ├── routes/index.js       # REST routes
│   ├── tests/                # Jest/Supertest тесты
│   ├── server.js             # Express entrypoint
│   ├── database/             # SQLite database создаётся здесь
│   └── uploads/              # audio/covers создаются и обслуживаются отсюда
├── frontend/
│   ├── public/service-worker.js
│   ├── src/
│   │   ├── pages/            # страницы Router
│   │   ├── features/auth/    # auth slice, формы, layout
│   │   ├── features/music/   # список, фильтры, плеер, music slice
│   │   ├── features/admin/   # admin panel + admin slice
│   │   ├── shared/api/       # axios client
│   │   ├── shared/lib/       # offline audio cache
│   │   ├── shared/types/     # общие TS-типы
│   │   └── styles/           # Tailwind/global CSS
│   └── vite.config.ts        # aliases, proxy, Vitest config
├── docs/PROJECT.md           # этот файл
├── README.md                 # основной README
├── API_DOCUMENTATION.md      # подробное API
├── QUICK_START.md            # короткий старт
├── docker-compose.yml        # dev compose
└── docker-compose.prod.yml   # prod compose
```

## Backend

Entry point: `backend/server.js`.

Express подключает:

- `cors()`;
- `express.json()` и `express.urlencoded()`;
- статику `/uploads` из `backend/uploads`;
- маршруты auth/tracks/tags/admin;
- `/health`;
- production-раздачу frontend build.

### База данных

SQLite открывается в `backend/config/db.js` по пути `backend/database/music.db`. При старте создаются таблицы:

- `users`: `id`, `username`, `password_hash`, `role`, `created_at`;
- `tracks`: `id`, `title`, `artist`, `file_path`, `cover_url`, `mood_type`, `created_by`, `created_at`;
- `user_tracks`: связь пользователя и приватных треков;
- `tags`: `id`, `name`, `color`, `created_at`;
- `track_tags`: many-to-many связь треков и тегов.

Если процесс запущен не под Jest, выполняется seed:

- admin-пользователь: `ADMIN_USERNAME` / `ADMIN_PASSWORD`, по умолчанию `admin` / `admin123`;
- базовые теги: `Фокус`, `Энергия`, `Спокойствие`, `Мотивация`, `Релакс`, `Тренировка`, `Медитация`, `Работа`;
- sample tracks с внешними cover URL и путями `/uploads/audio/...`.

### Авторизация и права

JWT создаётся в `backend/controllers/authController.js` и содержит `userId`, `username`, `role`. Секрет берётся из `JWT_SECRET`, срок — из `JWT_EXPIRES_IN` или `7d`.

Middleware в `backend/middleware/auth.js`:

- `authenticateToken` требует `Authorization: Bearer <token>`;
- `adminMiddleware` дополнительно требует `role === 'admin'`.

Владельцы могут редактировать и удалять свои треки. Администратор может редактировать/удалять любые треки и управлять тегами.

### Загрузка файлов

Multer настроен в `backend/config/storage.js`:

- поле `audio` сохраняется в `backend/uploads/audio`;
- поле `cover` сохраняется в `backend/uploads/covers`;
- имя файла получает префикс `Date.now()` + random suffix;
- разрешены MIME-типы `audio/mpeg`, `audio/wav`, `audio/mp3`, `image/jpeg`, `image/png`;
- общий лимит multipart-загрузки: 100 MB и до 2 файлов.

Важно: директории `backend/uploads/audio` и `backend/uploads/covers` должны существовать и быть доступны для записи.

## API

Базовый путь: `/api`.

### Auth

- `POST /api/auth/register` — регистрация. Body: `{ "username": "...", "password": "..." }`, пароль минимум 6 символов.
- `POST /api/auth/login` — вход.
- `GET /api/auth/profile` — профиль текущего пользователя, нужен Bearer token.

### Tracks

- `GET /api/tracks` — список треков. Query: `tag_id`, `mood_type`.
- `GET /api/tracks/:id` — один трек с тегами.
- `GET /api/tracks/private` — приватные треки текущего пользователя, нужен token.
- `POST /api/tracks` — создать трек, нужен token и `multipart/form-data`.
- `PUT /api/tracks/:id` — обновить `title`, `artist`, `mood_type`, `tags`.
- `DELETE /api/tracks/:id` — удалить трек и связанные файлы.
- `GET /api/admin/tracks` — все треки для админа.
- `POST /api/admin/tracks` — создать трек от имени админа.
- `DELETE /api/admin/tracks/:id` — удалить любой трек от имени админа.

Допустимые `mood_type`: `focus`, `energy`, `calm`, `motivation`, `relax`.

### Tags

- `GET /api/tags` — список тегов.
- `GET /api/tags/:id/tracks` — треки по тегу.
- `POST /api/tags` — создать тег, нужен admin.
- `PUT /api/tags/:id` — изменить тег, нужен admin.
- `DELETE /api/tags/:id` — удалить тег, нужен admin.

Подробнее по payload и ответам см. `API_DOCUMENTATION.md`.

## Frontend

Entry point: `frontend/src/main.tsx`.

Основные маршруты в `frontend/src/App.tsx`:

- `/music` — основная библиотека и плеер;
- `/login` — вход;
- `/register` — регистрация;
- `/music/new` — создание трека, только для авторизованных;
- `/music/:id/edit` — редактирование трека, только для авторизованных;
- `/admin` — админ-панель, только для `role === 'admin'`;
- `/` редиректит на `/music`.

### Состояние

Redux store собирается в `frontend/src/store/index.ts`.

Слайсы:

- `features/auth/store/authSlice.ts`: пользователь, JWT token, checkAuth/logout, хранение token в `localStorage`;
- `features/music/store/musicSlice.ts`: треки, теги, текущий трек, play/progress, offline cached IDs;
- `features/admin/store/adminSlice.ts`: список треков админки и операции удаления.

### API-клиент

`frontend/src/shared/api/axiosClient.ts` использует относительный base URL `/api`. Request interceptor добавляет Bearer token из `localStorage`. Response interceptor при `401` на `/auth/profile` удаляет token и переводит пользователя на `/login`.

### UI и фичи

- `MainPage.tsx`: шапка, auth/admin кнопки, вкладки `All Tracks` и `Offline`, фильтр тегов, список треков.
- `TrackList.tsx`: запуск трека, offline-кнопка, теги, mood badge, edit/delete controls.
- `features/music/player`: новый плеер через `usePlayerController`, `PlayerView`, команды и подписки на audio.
- `CreateTrackPage.tsx`: форма создания трека с выбором mood, тегов, audio и cover.
- `EditTrackPage.tsx`: редактирование метаданных и тегов.
- `AdminPanel.tsx`: вкладки `Tracks` и `Tags`, удаление треков, создание/удаление тегов.

## Offline-аудио

Offline-логика состоит из двух частей:

- `frontend/src/shared/lib/offlineAudioCache.ts` вручную кладёт выбранный audio URL в Cache Storage (`music-player-v1`), удаляет его и отдаёт blob URL для `<audio>`.
- `frontend/public/service-worker.js` в production регистрируется из `main.tsx`, кэширует базовые assets и audio-запросы `/uploads/audio/...`.

ID сохранённых offline-треков хранятся в `localStorage.cachedTrackIds`. Сам аудиофайл хранится в браузерном Cache Storage. Это локально для конкретного браузера/профиля, не синхронизируется между устройствами.

## Тесты

Backend:

```bash
cd backend
npm test
```

Покрывает auth, health, tracks, tags, admin через Jest/Supertest. В Jest seed данных отключается проверкой `JEST_WORKER_ID`.

Frontend:

```bash
cd frontend
npm test
```

Есть Vitest-тесты для offline cache, music slice cached tracks, player commands, форматирования времени и отображения треков.

Сборка frontend:

```bash
cd frontend
npm run build
```

## Переменные окружения

Backend:

- `PORT` — порт Express, по умолчанию `3000`;
- `NODE_ENV` — `production` включает раздачу `frontend/dist`;
- `JWT_SECRET` — секрет подписи JWT, обязателен для production;
- `JWT_EXPIRES_IN` — срок жизни JWT, по умолчанию `7d`;
- `ADMIN_USERNAME` — seed admin username, по умолчанию `admin`;
- `ADMIN_PASSWORD` — seed admin password, по умолчанию `admin123`.

Frontend/dev:

- `VITE_DEV_API_TARGET` — backend target для Vite proxy, по умолчанию `http://localhost:3000`.

## Важные нюансы и точки внимания

- `GET /api/tracks` сейчас возвращает все треки из таблицы `tracks`; отдельного поля публичности в схеме нет. Таблица `user_tracks` существует и используется для `/api/tracks/private`, но создание трека сейчас не добавляет запись в `user_tracks`.
- Sample tracks ссылаются на `/uploads/audio/*.mp3`, но реальные файлы могут отсутствовать после чистого старта. Это нормально для демо-метаданных, но такие треки не проиграются без файлов.
- В `service-worker.js` сейчас два обработчика `fetch`; при доработке offline/PWA стоит привести файл к одному обработчику, чтобы поведение было проще прогнозировать.
- `storage.js` экспортирует основной `upload`, а также `uploadAudio` и `uploadCover`; маршруты используют именно `upload.fields(...)`.
- При удалении трека backend удаляет связанные audio/cover файлы с диска, если они существуют.
- Для backup production нужны как минимум БД и загруженные файлы: `backend/database` и `backend/uploads`, либо соответствующие Docker volumes.

## Где что менять

- Добавить новый mood: backend `controllers/trackController.js`, frontend `CreateTrackPage.tsx`, `EditTrackPage.tsx`, `shared/config/moodColors.ts`, при необходимости TS-типы.
- Изменить API: `backend/routes/index.js` + соответствующий controller, затем `frontend/src/shared/api/axiosClient.ts`.
- Изменить auth flow: `backend/controllers/authController.js`, `middleware/auth.js`, `features/auth/store/authSlice.ts`.
- Изменить отображение списка треков: `features/music/components/TrackList.tsx`.
- Изменить плеер: `features/music/player/*`.
- Изменить offline-кэш: `shared/lib/offlineAudioCache.ts` и `public/service-worker.js`.
- Изменить админку: `features/admin/components/AdminPanel.tsx` и `features/admin/store/adminSlice.ts`.

## Связанная документация

- `README.md` — основной обзор, запуск и краткое API.
- `QUICK_START.md` — быстрый старт.
- `API_DOCUMENTATION.md` — подробное HTTP API.
- `PROJECT_COMPLETE.md` и `CREATION_REPORT.md` — исторические/итоговые отчёты по созданию проекта.
