# Music Player Backend

API сервер для музыкального плеера с локальным хранилищем.

## Установка

```bash
npm install
```

## Запуск

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

Сервер запустится на http://localhost:3000

## Структура

- `/config` - конфигурация базы данных и multer
- `/controllers` - обработчики запросов
- `/middleware` - middleware для авторизации и загрузки файлов
- `/routes` - API роуты
- `/uploads` - загруженные файлы
- `/database` - база данных SQLite

## API Endpoints

### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/profile` - получить профиль (требуется токен)

### Треки
- `GET /api/tracks` - публичный список треков
- `GET /api/tracks/:id` - информация о треке
- `GET /api/tracks/private` - приватные треки пользователя (требуется токен)
- `POST /api/tracks` - создать трек (требуется токен)
- `PUT /api/tracks/:id` - обновить трек (требуется токен)
- `DELETE /api/tracks/:id` - удалить трек (требуется токен)
- `GET /api/admin/tracks` - админ панель (требуется токен)