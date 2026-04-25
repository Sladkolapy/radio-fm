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

### Backend

```bash
cd backend
npm install
npm run dev      # Development mode
npm start        # Production mode
```

Сервер запустится на http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev      # Development mode
npm run build    # Production build
```

Приложение запустится на http://localhost:5173

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
3. Добавьте новый цвет в объект moodColors в `frontend/src/features/music/components/TrackList.tsx`

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