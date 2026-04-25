# API Documentation

Музыкальный плеер API документация.

## Базовый URL

```
http://localhost:3000/api
```

## Аутентификация

Все защищенные роуты требуют токен авторизации в заголовке:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Статус коды

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Авторизация

### Регистрация

**POST** `/auth/register`

Создает нового пользователя.

**Тело запроса:**
```json
{
  "username": "username",
  "password": "password"
}
```

**Ответ (201):**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "username"
  }
}
```

### Вход

**POST** `/auth/login`

Авторизует пользователя и возвращает токен.

**Тело запроса:**
```json
{
  "username": "username",
  "password": "password"
}
```

**Ответ (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "username"
  }
}
```

### Получить профиль

**GET** `/auth/profile`

Получает информацию о текущем пользователе.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "user": {
    "id": 1,
    "username": "username",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Треки

### Получить все треки (публичные)

**GET** `/tracks`

Возвращает список всех публичных треков.

**Ответ (200):**
```json
{
  "tracks": [
    {
      "id": 1,
      "title": "Track Title",
      "artist": "Artist Name",
      "cover_url": "/uploads/covers/123-cover.jpg",
      "mood_type": "focus",
      "created_at": "2024-01-01T00:00:00.000Z",
      "creator_name": "creator"
    }
  ]
}
```

### Получить трек по ID

**GET** `/tracks/:id`

Возвращает информацию о конкретном треке.

**Параметры:**
- `id` (path) - ID трека

**Ответ (200):**
```json
{
  "track": {
    "id": 1,
    "title": "Track Title",
    "artist": "Artist Name",
    "file_path": "/uploads/audio/test.mp3",
    "cover_url": "/uploads/covers/123-cover.jpg",
    "mood_type": "focus",
    "created_at": "2024-01-01T00:00:00.000Z",
    "is_public": true
  }
}
```

### Получить приватные треки

**GET** `/tracks/private`

Возвращает список треков текущего пользователя.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "tracks": [
    {
      "id": 1,
      "title": "My Track",
      "artist": "My Artist",
      "file_path": "/uploads/audio/test.mp3",
      "cover_url": "/uploads/covers/123-cover.jpg",
      "mood_type": "focus",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "user_id": 1
}
```

### Создать трек

**POST** `/tracks`

Создает новый трек с загрузкой аудио файла и обложки.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Тело запроса:**
```
audio: (binary) - MP3 или WAV файл
title: "Track Title" - строка
artist: "Artist Name" - строка
mood_type: "focus" - строка (focus, energy, calm, motivation, relax)
cover: (binary) - JPG или PNG файл (опционально)
```

**Ответ (201):**
```json
{
  "message": "Track created successfully",
  "track": {
    "id": 1,
    "title": "Track Title",
    "artist": "Artist Name",
    "file_path": "/uploads/audio/123-audio.mp3",
    "cover_url": "/uploads/covers/123-cover.jpg",
    "mood_type": "focus"
  }
}
```

### Обновить трек

**PUT** `/tracks/:id`

Обновляет информацию о треке.

**Параметры:**
- `id` (path) - ID трека

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Тело запроса:**
```
title: "New Title" - строка (опционально)
artist: "New Artist" - строка (опционально)
mood_type: "focus" - строка (опционально)
audio: (binary) - MP3 или WAV файл (опционально)
cover: (binary) - JPG или PNG файл (опционально)
```

**Ответ (200):**
```json
{
  "message": "Track updated successfully"
}
```

### Удалить трек

**DELETE** `/tracks/:id`

Удаляет трек и связанные файлы.

**Параметры:**
- `id` (path) - ID трека

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "message": "Track deleted successfully"
}
```

### Административный доступ

**GET** `/admin/tracks`

Возвращает список всех треков с информацией о создателях.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "tracks": [
    {
      "id": 1,
      "title": "Track Title",
      "artist": "Artist Name",
      "file_path": "/uploads/audio/test.mp3",
      "cover_url": "/uploads/covers/123-cover.jpg",
      "mood_type": "focus",
      "created_at": "2024-01-01T00:00:00.000Z",
      "creator_name": "username"
    }
  ],
  "admin_id": 1
}
```

---

## Mood Types

### focus
Фокус и концентрация. Подходит для работы, учебы, чтения.

### energy
Высокая энергия. Подходит для тренировок, активной деятельности.

### calm
Спокойствие и расслабление. Подходит для медитации, отдыха.

### motivation
Мотивация и вдохновение. Подходит для достижения целей.

### relax
Релаксация и сон. Подходит для вечернего отдыха и сна.

---

## Ошибки

### Общая ошибка
```json
{
  "error": "Error message here"
}
```

### Ошибки валидации
```json
{
  "error": "Username is required"
}
```

### Ошибка авторизации
```json
{
  "error": "Invalid or expired token"
}
```

### Дубликат пользователя
```json
{
  "error": "Username already exists"
}
```

### Трек не найден
```json
{
  "error": "Track not found"
}
```

### Доступ запрещен
```json
{
  "error": "Not authorized to access this resource"
}
```

---

## Примеры использования cURL

### Регистрация
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Вход
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Получить все треки
```bash
curl http://localhost:3000/api/tracks
```

### Создать трек
```bash
curl -X POST http://localhost:3000/api/tracks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/audio.mp3" \
  -F "title=Track Title" \
  -F "artist=Artist Name" \
  -F "mood_type=focus" \
  -F "cover=@/path/to/cover.jpg"
```

### Удалить трек
```bash
curl -X DELETE http://localhost:3000/api/tracks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```