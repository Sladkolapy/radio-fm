# Music Player Frontend

React + TypeScript + Vite + TailwindCSS музыкальный плеер.

## Установка

```bash
npm install
```

## Запуск

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Приложение запустится на http://localhost:5173

## Функциональность

- Авторизация и регистрация пользователей
- Библиотека треков с поиском
- Музыкальный плеер с прогресс-баром и управлением воспроизведением
- Mood selector для выбора настроения треков
- Создание, редактирование и удаление треков (для авторизованных пользователей)
- Админ панель для управления всеми треками

## Структура

- `/features/auth` - модуль авторизации
- `/features/music` - модуль музыкального плеера
- `/features/admin` - админ панель
- `/shared` - общий функционал (API, UI компоненты)
- `/pages` - отдельные страницы
- `/store` - Redux store
- `/styles` - глобальные стили

## API интеграция

Приложение подключается к API на http://localhost:3000

Токен авторизации хранится в localStorage и автоматически добавляется к запросам через axios interceptor.