# Тестирование

## Backend

Запуск:

```bash
cd backend
npm test
```

Тестовый стек:

- Jest;
- Supertest;
- Node test environment.

Тесты лежат в `backend/tests/`:

- `auth.test.js`;
- `tracks.test.js`;
- `tags.test.js`;
- `admin.test.js`;
- `health.test.js`.

В `backend/jest.config.js` включён coverage. Пороги сейчас стоят в `0`, поэтому coverage собирается как отчёт, но не блокирует тесты.

Seed данных в Jest отключается проверкой `JEST_WORKER_ID` в `backend/config/db.js`.

## Frontend

Запуск:

```bash
cd frontend
npm test
```

Тестовый стек:

- Vitest;
- jsdom;
- Testing Library;
- jest-dom matchers.

Покрытые участки:

- offline audio cache;
- music slice cached tracks;
- player commands;
- форматирование времени;
- отображение треков.

## Сборка frontend

```bash
cd frontend
npm run build
```

Команда запускает TypeScript check и Vite build. Артефакты попадают в `frontend/dist`.

## Быстрая ручная проверка

Backend:

```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:

```json
{"status":"ok","timestamp":"..."}
```

Frontend:

```text
http://localhost:5173
```
