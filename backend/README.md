# PingMusic Backend

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

Сервер слушает порт из `process.env.PORT` или **3000**. В **production** (`NODE_ENV=production`) Express отдаёт собранный фронтенд из `../frontend/dist` (соберите фронтенд заранее).

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

### Теги
- `GET /api/tags` - список тегов
- `GET /api/tags/:id/tracks` - треки по тегу
- операции создания/изменения/удаления тегов — см. [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) (админ)