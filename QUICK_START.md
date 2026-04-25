# 🚀 Быстрый старт

## Установка

```bash
./setup.sh
```

## Запуск

### Backend (откройте первое терминальное окно)
```bash
cd backend
npm run dev
```

### Frontend (откройте второе терминальное окно)
```bash
cd frontend
npm run dev
```

## Доступ

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Регистрация

1. Зайдите на http://localhost:5173
2. Нажмите "Sign Up"
3. Создайте аккаунт
4. Начните создавать треки!

## Или используйте Postman:

```bash
# Регистрация
POST http://localhost:3000/api/auth/register
{"username":"yourname","password":"123456"}

# Вход
POST http://localhost:3000/api/auth/login
{"username":"yourname","password":"123456"}

# Создать трек
POST http://localhost:3000/api/tracks
Authorization: Bearer YOUR_TOKEN
-F "audio=@file.mp3"
-F "title=Track"
-F "artist=Artist"
-F "mood_type=focus"
```

## Тестирование API

```bash
cd backend
node test-api.js
```

## Документация

- Полная документация: `PROJECT_COMPLETE.md`
- API Reference: `API_DOCUMENTATION.md`