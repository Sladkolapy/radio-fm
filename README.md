# Музыкальный плеер с локальным хранилищем

Полный музыкальный плеер с локальным хранилищем файлов, созданный с использованием Node.js + Express + SQLite для бэкенда и React + TypeScript + Vite для фронтенда.

## Технологии

### Backend
- Node.js + Express
- SQLite3
- Multer (загрузка файлов)
- JWT авторизация
- Bcrypt (хеширование паролей)
- CORS

### Frontend
- React 18
- TypeScript
- Vite
- Redux Toolkit
- TailwindCSS
- React Router
- Axios

## Структура проекта

```
my_music_player/
├── backend/                    # Backend сервер
│   ├── server.js              # Основной файл сервера
│   ├── config/                # Конфигурация
│   ├── controllers/           # Контроллеры
│   ├── middleware/            # Middleware
│   ├── routes/                # API роуты
│   ├── uploads/               # Загруженные файлы
│   ├── database/              # База данных
│   └── package.json
└── frontend/                   # Frontend приложение
    ├── src/
    │   ├── features/          # Фичи приложения
    │   ├── pages/             # Страницы
    │   ├── shared/            # Общий функционал
    │   ├── store/             # Redux store
    │   ├── styles/            # Стили
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## Установка и запуск

Первичная установка зависимостей (корень репозитория):

```bash
./setup.sh
```

Либо вручную: `npm install` в каталогах `backend` и `frontend`. Подробный пошаговый сценарий — в [QUICK_START.md](QUICK_START.md).

### Разработка (два процесса)

**Backend** — порт по умолчанию `3000` (переопределяется переменной `PORT` в `.env` в каталоге `backend`).

```bash
cd backend
npm install
npm run dev      # nodemon
```

**Frontend** — Vite проксирует `/api` и `/uploads` на `http://localhost:3000` (см. `frontend/vite.config.ts`). Клиент ходит в API по относительному пути `/api`, а не на полный URL.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Сборка фронтенда без запуска сервера разработки:

```bash
cd frontend
npm run build    # артефакты в frontend/dist
npm run preview  # опционально: проверка production-сборки (порт см. в выводе Vite)
```

### Развёртывание на сервере (production)

В production один процесс **Express** поднимается из каталога `backend` и, при `NODE_ENV=production`, отдаёт статику из `../frontend/dist` и API с того же хоста/порта (см. `backend/server.js`).

1. Собрать фронтенд: `cd frontend && npm ci && npm run build`.
2. В `backend` создать `.env` (образец — [backend/.env.example](backend/.env.example)): задать **JWT_SECRET** и при необходимости **PORT**.
3. Запустить: `cd backend && NODE_ENV=production npm start`.

Пользователи открывают одно приложение: `http://<хост>:<PORT>/` (API: `http://<хост>:<PORT>/api/...`).

**Важно:** пути `uploads/` и `database/` на сервере должны быть доступны для записи процессу Node. Резервное копирование — как минимум каталог `backend/database` и `backend/uploads`.

## Функциональность

### Авторизация
- Регистрация новых пользователей
- Вход в систему
- JWT токены авторизации
- Выход из системы

### Управление треками
- Просмотр всех треков
- Прослушивание треков с плеером
- Mood selector для выбора настроения треков
- Создание новых треков с загрузкой аудио и обложек
- Редактирование и удаление треков
- Админ панель для управления всеми треками

### API Endpoints

#### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/profile` - получить профиль (требуется токен)

#### Треки
- `GET /api/tracks` - публичный список треков
- `GET /api/tracks/:id` - информация о треке
- `GET /api/tracks/private` - приватные треки пользователя (требуется токен)
- `POST /api/tracks` - создать трек (требуется токен)
- `PUT /api/tracks/:id` - обновить трек (требуется токен)
- `DELETE /api/tracks/:id` - удалить трек (требуется токен)
- `GET /api/admin/tracks` - админ панель (требуется токен)

#### Теги
- `GET /api/tags` - список тегов
- `GET /api/tags/:id/tracks` - треки по тегу
- `POST /api/tags`, `PUT /api/tags/:id`, `DELETE /api/tags/:id` - создание/изменение/удаление (токен + права администратора)

### Mood Types
- `focus` - Фокус
- `energy` - Энергичность
- `calm` - Спокойствие
- `motivation` - Мотивация
- `relax` - Релаксация

## Требования

### Node.js
- Node.js 18+ recommended
- npm или yarn

### Дополнительно
- Tailwind CSS CLI для компиляции стилей (уже включен в dev dependencies)
- React Router для навигации (уже включен в dependencies)

## Безопасность

- Пароли хешируются с bcrypt
- JWT токены для авторизации
- Защита маршрутов от неавторизованных запросов
- Валидация загружаемых файлов
- Ограничение размера файлов (100MB для аудио, 5MB для обложек)

## Разработка

### Добавление новых mood типов

1. Добавьте новый mood в массив moodOptions в `frontend/src/features/music/components/MoodSelector.tsx`
2. Добавьте новый mood в массив moodTypes в `backend/controllers/trackController.js`
3. Добавьте цвет в `frontend/src/shared/config/moodColors.ts` (тип `Track['mood_type']` при необходимости обновить в типах)

### Добавление нового трека через API

```bash
curl -X POST http://localhost:3000/api/tracks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/audio.mp3" \
  -F "title=Track Title" \
  -F "artist=Artist Name" \
  -F "mood_type=focus" \
  -F "cover=@/path/to/cover.jpg"
```

## Лицензия

MIT