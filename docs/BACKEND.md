# Backend

Backend находится в `backend/` и запускается из `backend/server.js`.

## Express setup

`server.js` подключает:

- `cors()`;
- `express.json()` и `express.urlencoded()`;
- статику `/uploads` из `backend/uploads`;
- маршруты auth/tracks/tags/admin;
- `/health`;
- production-раздачу `../frontend/dist`.

При `NODE_ENV=production` Express также отдаёт frontend build и fallback на `index.html` для SPA-маршрутов.

## База данных

SQLite открывается в `backend/config/db.js` по пути `backend/database/music.db`.

При старте создаются таблицы:

- `users`: `id`, `username`, `password_hash`, `role`, `created_at`;
- `tracks`: `id`, `title`, `artist`, `file_path`, `cover_url`, `mood_type`, `created_by`, `created_at`;
- `user_tracks`: `user_id`, `track_id`, `created_at`;
- `tags`: `id`, `name`, `color`, `created_at`;
- `track_tags`: `track_id`, `tag_id`.

Если процесс запущен не под Jest, выполняется seed:

- admin-пользователь: `ADMIN_USERNAME` / `ADMIN_PASSWORD`, по умолчанию `admin` / `admin123`;
- базовые теги: `Фокус`, `Энергия`, `Спокойствие`, `Мотивация`, `Релакс`, `Тренировка`, `Медитация`, `Работа`;
- sample tracks с внешними cover URL и путями `/uploads/audio/...`.

## Авторизация

Auth-контроллер: `backend/controllers/authController.js`.

JWT содержит:

- `userId`;
- `username`;
- `role`.

Настройки:

- `JWT_SECRET` — секрет подписи;
- `JWT_EXPIRES_IN` — срок жизни token, по умолчанию `7d`.

Middleware находится в `backend/middleware/auth.js`:

- `authenticateToken` требует `Authorization: Bearer <token>`;
- `adminMiddleware` требует `role === 'admin'`.

## Права

- Неавторизованный пользователь может смотреть публичный список треков, один трек и список тегов.
- Авторизованный пользователь может создавать треки.
- Владелец трека может редактировать и удалять свой трек.
- Администратор может редактировать/удалять любые треки и управлять тегами.

## Загрузка файлов

Multer настроен в `backend/config/storage.js`.

- `audio` сохраняется в `backend/uploads/audio`.
- `cover` сохраняется в `backend/uploads/covers`.
- Имя файла получает префикс `Date.now()` + random suffix.
- Разрешены MIME-типы: `audio/mpeg`, `audio/wav`, `audio/mp3`, `image/jpeg`, `image/png`.
- Лимит основного upload middleware: 100 MB и до 2 файлов.

Маршруты используют `upload.fields([{ name: 'audio' }, { name: 'cover' }])`.

Важно: директории `backend/uploads/audio` и `backend/uploads/covers` должны существовать и быть доступны для записи.

## API-карта

Базовый путь: `/api`.

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
- `POST /api/admin/tracks`
- `DELETE /api/admin/tracks/:id`

Tags:

- `GET /api/tags`
- `GET /api/tags/:id/tracks`
- `POST /api/tags`
- `PUT /api/tags/:id`
- `DELETE /api/tags/:id`

Подробные payload и ответы описаны в `API_DOCUMENTATION.md`.

## Mood types

Допустимые значения `mood_type`:

- `focus`
- `energy`
- `calm`
- `motivation`
- `relax`
