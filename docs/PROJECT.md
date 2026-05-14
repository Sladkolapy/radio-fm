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

## Документация

- [Архитектура](./ARCHITECTURE.md) — структура репозитория, слои приложения и поток данных.
- [Backend](./BACKEND.md) — Express, SQLite, auth, права, загрузка файлов и API-карта.
- [Frontend](./FRONTEND.md) — маршруты, Redux, API-клиент, UI-модули и offline-аудио.
- [Запуск и деплой](./DEPLOYMENT.md) — dev, Docker, production, переменные окружения и backup.
- [Тестирование](./TESTING.md) — команды и наборы тестов.
- [Разработка и поддержка](./MAINTENANCE.md) — где что менять и текущие нюансы проекта.
- [API reference](../API_DOCUMENTATION.md) — подробное описание HTTP API.
- [Быстрый старт](../QUICK_START.md) — минимальная инструкция запуска.

## Быстрые адреса

Development:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

Production:

- Один Express-сервер отдаёт API и собранный frontend на backend-порту.

## Первый вход

Backend при старте создаёт администратора, если его ещё нет:

- логин: `admin`
- пароль: `admin123`

Для production эти значения лучше переопределить через `ADMIN_USERNAME` и `ADMIN_PASSWORD`.
