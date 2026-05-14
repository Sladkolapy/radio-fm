# Разработка и поддержка

Этот файл отвечает на вопрос “где что менять”, когда нужно доработать проект.

## Где что менять

Добавить новый `mood_type`:

- backend: `backend/controllers/trackController.js`;
- frontend forms: `frontend/src/pages/CreateTrackPage.tsx`, `frontend/src/pages/EditTrackPage.tsx`;
- цвета: `frontend/src/shared/config/moodColors.ts`;
- типы при необходимости: `frontend/src/shared/types/index.ts`.

Изменить API:

- routes: `backend/routes/index.js`;
- controller: `backend/controllers/*Controller.js`;
- frontend client: `frontend/src/shared/api/axiosClient.ts`;
- Redux thunk при необходимости: `features/*/store/*Slice.ts`.

Изменить auth flow:

- backend: `backend/controllers/authController.js`;
- middleware: `backend/middleware/auth.js`;
- frontend state: `frontend/src/features/auth/store/authSlice.ts`;
- forms/layout: `frontend/src/features/auth/*`.

Изменить список треков:

- `frontend/src/features/music/components/TrackList.tsx`;
- `frontend/src/pages/MainPage.tsx`;
- `frontend/src/features/music/store/musicSlice.ts`.

Изменить плеер:

- `frontend/src/features/music/player/*`;
- старый компонент `frontend/src/features/music/components/Player.tsx` тоже есть в проекте, перед изменениями важно проверить, какой компонент реально импортируется на нужной странице.

Изменить offline-кэш:

- `frontend/src/shared/lib/offlineAudioCache.ts`;
- `frontend/public/service-worker.js`;
- `frontend/src/features/music/components/TrackList.tsx`.

Изменить админку:

- `frontend/src/features/admin/components/AdminPanel.tsx`;
- `frontend/src/features/admin/store/adminSlice.ts`;
- backend admin routes в `backend/routes/index.js`.

## Текущие нюансы

- `GET /api/tracks` сейчас возвращает все треки из таблицы `tracks`; отдельного поля публичности в схеме нет.
- Таблица `user_tracks` существует и используется для `/api/tracks/private`, но создание трека сейчас не добавляет запись в `user_tracks`.
- Sample tracks ссылаются на `/uploads/audio/*.mp3`, но реальные файлы могут отсутствовать после чистого старта. Такие треки не проиграются без файлов.
- В `service-worker.js` сейчас два обработчика `fetch`; при доработке offline/PWA стоит привести файл к одному обработчику.
- `storage.js` экспортирует основной `upload`, а также `uploadAudio` и `uploadCover`; маршруты используют `upload.fields(...)`.
- При удалении трека backend удаляет связанные audio/cover файлы с диска, если они существуют.

## Полезные команды

Backend dev:

```bash
cd backend
npm run dev
```

Frontend dev:

```bash
cd frontend
npm run dev
```

Backend tests:

```bash
cd backend
npm test
```

Frontend tests:

```bash
cd frontend
npm test
```

Frontend build:

```bash
cd frontend
npm run build
```
