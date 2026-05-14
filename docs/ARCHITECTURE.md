# Архитектура

PingMusic состоит из двух основных приложений:

- `backend` — Express API, SQLite, хранение файлов и авторизация.
- `frontend` — React SPA с библиотекой треков, плеером, формами и админкой.

В development frontend и backend запускаются отдельными процессами. Vite проксирует `/api` и `/uploads` на backend.

В production backend может работать как единый сервер: Express отдаёт REST API, файлы из `/uploads` и собранный frontend из `frontend/dist`.

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
├── docs/                     # проектная документация
├── README.md                 # основной README
├── API_DOCUMENTATION.md      # подробное API
├── QUICK_START.md            # короткий старт
├── docker-compose.yml        # dev compose
└── docker-compose.prod.yml   # prod compose
```

## Поток данных

1. Пользователь открывает React SPA.
2. Frontend вызывает API по относительному пути `/api`.
3. Axios interceptor добавляет `Authorization: Bearer <token>` из `localStorage`.
4. Express проверяет token через JWT middleware.
5. Контроллеры читают и пишут данные в SQLite.
6. Загруженные аудио и обложки сохраняются в `backend/uploads`.
7. Frontend получает метаданные треков, а медиа загружает из `/uploads/...`.

## Основные сущности

- `User` — пользователь с ролью `user` или `admin`.
- `Track` — трек с названием, артистом, путём к audio, optional cover, mood и автором.
- `Tag` — тег с названием и цветом.
- `track_tags` — связь many-to-many между треками и тегами.
- `user_tracks` — связь пользователя и приватных треков.

## Границы ответственности

- Backend отвечает за данные, права, загрузку файлов и статическую раздачу media.
- Frontend отвечает за состояние интерфейса, маршруты, формы, плеер и offline-кэш в браузере.
- Docker Compose отвечает только за запуск сервисов и volume для persistent данных.
