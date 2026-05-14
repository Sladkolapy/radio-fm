# Frontend

Frontend находится в `frontend/` и запускается через Vite.

Entry point: `frontend/src/main.tsx`.

## Маршруты

Основные маршруты описаны в `frontend/src/App.tsx`:

- `/music` — основная библиотека и плеер;
- `/login` — вход;
- `/register` — регистрация;
- `/music/new` — создание трека, только для авторизованных;
- `/music/:id/edit` — редактирование трека, только для авторизованных;
- `/admin` — админ-панель, только для `role === 'admin'`;
- `/` редиректит на `/music`.

## Состояние

Redux store собирается в `frontend/src/store/index.ts`.

Основные слайсы:

- `features/auth/store/authSlice.ts` — пользователь, JWT token, checkAuth/logout, хранение token в `localStorage`.
- `features/music/store/musicSlice.ts` — треки, теги, текущий трек, play/progress, offline cached IDs.
- `features/admin/store/adminSlice.ts` — список треков админки и операции удаления.

## API-клиент

`frontend/src/shared/api/axiosClient.ts` использует относительный base URL `/api`.

Request interceptor добавляет Bearer token из `localStorage`.

Response interceptor при `401` на `/auth/profile` удаляет token и переводит пользователя на `/login`.

В development Vite проксирует `/api` и `/uploads` на backend. Настройка находится в `frontend/vite.config.ts`.

## Основные UI-модули

- `pages/MainPage.tsx` — шапка, auth/admin кнопки, вкладки `All Tracks` и `Offline`, фильтр тегов, список треков.
- `features/music/components/TrackList.tsx` — запуск трека, offline-кнопка, теги, mood badge, edit/delete controls.
- `features/music/player/*` — новый плеер через `usePlayerController`, `PlayerView`, команды и подписки на audio.
- `pages/CreateTrackPage.tsx` — форма создания трека с выбором mood, тегов, audio и cover.
- `pages/EditTrackPage.tsx` — редактирование метаданных и тегов.
- `features/admin/components/AdminPanel.tsx` — вкладки `Tracks` и `Tags`, удаление треков, создание/удаление тегов.

## Offline-аудио

Offline-логика состоит из двух частей:

- `frontend/src/shared/lib/offlineAudioCache.ts` вручную кладёт выбранный audio URL в Cache Storage (`music-player-v1`), удаляет его и отдаёт blob URL для `<audio>`.
- `frontend/public/service-worker.js` в production регистрируется из `main.tsx`, кэширует базовые assets и audio-запросы `/uploads/audio/...`.

ID сохранённых offline-треков хранятся в `localStorage.cachedTrackIds`. Сам аудиофайл хранится в браузерном Cache Storage. Это локально для конкретного браузера/профиля и не синхронизируется между устройствами.

## Алиасы импортов

Настроены в `frontend/vite.config.ts`:

- `@` -> `/src`
- `@features` -> `/src/features`
- `@shared` -> `/src/shared`
- `@pages` -> `/src/pages`
- `@store` -> `/src/store`
- `@config` -> `/src/shared/config`
