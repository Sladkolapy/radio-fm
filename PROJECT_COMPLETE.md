# Музыкальный плеер - Финальная документация

## 🎵 Проект создан успешно!

Создан полный музыкальный плеер с локальным хранилищем файлов, использующий:
- **Backend:** Node.js + Express + SQLite
- **Frontend:** React + TypeScript + Vite + TailwindCSS + Redux Toolkit

## 📁 Структура проекта

```
my_music_player/
├── backend/                              # Backend сервер
│   ├── .env                             # Конфигурация
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                        # Основной файл сервера
│   ├── README.md
│   ├── test-api.js                      # Скрипт тестирования API
│   ├── create-test-tracks.js            # Создание тестовых треков
│   ├── config/                          # Конфигурация
│   │   ├── db.js                        # SQLite настройка с seeding
│   │   └── storage.js                   # Multer настроика
│   ├── controllers/                     # Контроллеры
│   │   ├── authController.js            # Авторизация
│   │   └── trackController.js           # Управление треками
│   ├── middleware/                      # Middleware
│   │   ├── auth.js                      # JWT валидация
│   │   └── upload.js                    # Multer middleware
│   ├── routes/                          # API роуты
│   │   ├── auth.js
│   │   └── tracks.js
│   ├── uploads/                         # Загруженные файлы
│   │   ├── audio/                       # MP3 файлы
│   │   └── covers/                      # Обложки
│   └── database/                        # База данных
│       └── music.db                     # SQLite база (создастся автоматически)
│
├── frontend/                             # Frontend приложение
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx                     # Точка входа
│   │   ├── App.tsx                      # Основной роутинг
│   │   ├── index.jsx
│   │   ├── index.css                    # Глобальные стили
│   │   ├── store/
│   │   │   └── index.ts                 # Redux store
│   │   ├── shared/                      # Общий функционал
│   │   │   ├── hooks/
│   │   │   │   └── index.ts             # Custom hooks
│   │   │   ├── api/
│   │   │   │   └── axiosClient.ts       # API клиент
│   │   │   ├── types/
│   │   │   │   └── index.ts             # TypeScript типы
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── cn.ts                # Tailwind util
│   │   │   └── utils/
│   │   │       └── cn.ts
│   │   ├── features/                    # Redux features
│   │   │   ├── auth/
│   │   │   │   ├── store/
│   │   │   │   │   └── authSlice.ts      # Auth reducer
│   │   │   │   ├── components/
│   │   │   │   │   └── AuthForms.tsx     # Формы входа/регистрации
│   │   │   │   └── ui/
│   │   │   │       └── AuthLayout.tsx
│   │   │   ├── music/
│   │   │   │   ├── store/
│   │   │   │   │   └── musicSlice.ts     # Music reducer
│   │   │   │   ├── components/
│   │   │   │   │   ├── Player.tsx        # Музыкальный плеер
│   │   │   │   │   ├── TrackList.tsx     # Список треков
│   │   │   │   │   ├── MoodSelector.tsx  # Mood selector
│   │   │   │   │   ├── CreateTrackForm.tsx # Форма создания трека
│   │   │   │   └── ui/
│   │   │   │       └── MusicLayout.tsx
│   │   │   └── admin/
│   │   │       └── components/
│   │   │           └── AdminPanel.tsx    # Админ панель
│   │   └── pages/                       # Страницы
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── MainPage.tsx
│   │       └── AdminPage.tsx
│   └── public/                          # Статичные файлы
│
├── API_DOCUMENTATION.md                  # Документация API
├── README.md                            # Основной README
├── setup.sh                             # Скрипт установки зависимостей
└── init-project.js                      # Скрипт инициализации проекта
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
./setup.sh
```

Или вручную:

```bash
cd backend && npm install
cd frontend && npm install
```

### 2. Запуск Backend

```bash
cd backend
npm run dev      # Development mode (с nodemon)
npm start        # Production mode
```

Backend запустится на http://localhost:3000

### 3. Запуск Frontend

Откройте новое терминальное окно:

```bash
cd frontend
npm run dev
```

Frontend запустится на http://localhost:5173

## 🎯 Функциональность

### Авторизация
- ✅ Регистрация новых пользователей
- ✅ Вход в систему
- ✅ JWT токены авторизации
- ✅ Хеширование паролей (bcrypt)
- ✅ Защита роутов

### Управление треками
- ✅ Просмотр всех треков
- ✅ Прослушивание с музыкальным плеером
- ✅ Mood selector (Фокус, Энергичность, Спокойствие, Мотивация, Релаксация)
- ✅ Создание треков с загрузкой аудио и обложек
- ✅ Редактирование треков
- ✅ Удаление треков
- ✅ Админ панель

### API Endpoints

#### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/profile` - профиль пользователя

#### Треки
- `GET /api/tracks` - публичный список треков
- `GET /api/tracks/:id` - информация о треке
- `GET /api/tracks/private` - приватные треки
- `POST /api/tracks` - создать трек
- `PUT /api/tracks/:id` - обновить трек
- `DELETE /api/tracks/:id` - удалить трек
- `GET /api/admin/tracks` - админ список треков

## 📊 База данных

### Таблицы
- **users** - пользователи (id, username, password_hash, created_at)
- **tracks** - треки (id, title, artist, file_path, cover_url, mood_type, created_by, created_at)
- **user_tracks** - связь пользователь-трек (user_id, track_id)

### Начальные данные
Система автоматически создает 8 примеровых треков с разными mood_type при первом запуске.

## 🎨 UI/UX

### Компоненты
- **AuthForms** - красивые формы входа и регистрации
- **Player** - полноэкранный плеер с прогресс-баром
- **TrackList** - красивый список треков с mood badges
- **MoodSelector** - 5 кнопок для выбора настроения
- **CreateTrackForm** - форма создания трека с превью обложки

### Дизайн
- Modern gradient backgrounds
- Smooth animations
- Responsive design
- TailwindCSS стилизация

## 🔒 Безопасность

- Пароли хешируются bcrypt (10 rounds)
- JWT токены с сроком действия 24 часа
- Защита всех защищенных роутов
- Валидация загружаемых файлов
- Ограничение размера файлов (100MB для аудио)

## 🧪 Тестирование

### Тестирование API

```bash
cd backend
node test-api.js
```

Скрипт автоматически:
1. Регистрирует нового пользователя
2. Логинится
3. Получает все треки
4. Создает трек
5. Получает приватные треки
6. Просматривает админ панель

## 📝 Дополнительные файлы

- `README.md` - подробная документация
- `API_DOCUMENTATION.md` - полная документация API
- `setup.sh` - автоматический скрипт установки
- `init-project.js` - инициализация проекта
- `backend/create-test-tracks.js` - создание метаданных тестовых треков

## 🔧 Настройка

### Изменение порта

**Backend** (`backend/.env`):
```
PORT=3000
```

**Frontend** (`frontend/vite.config.ts`):
```typescript
server: {
  port: 5173
}
```

### JWT Secret

Измените `JWT_SECRET` в `backend/.env` для продакшена.

## 🎵 Mood Types

- **focus** - Фокус и концентрация
- **energy** - Энергичность и активность
- **calm** - Спокойствие и расслабление
- **motivation** - Мотивация и вдохновение
- **relax** - Релаксация и сон

## 📚 Ресурсы

### Документация
- API Documentation: `API_DOCUMENTATION.md`
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

### Утилиты
- `test-api.js` - тестирование API
- `create-test-tracks.js` - создание тестовых треков
- `setup.sh` - установка зависимостей
- `init-project.js` - инициализация

## 🎉 Готово!

Проект полностью готов к использованию. Все файлы созданы, зависимости установлены, документация подготовлена.

Запустите проект и наслаждайтесь вашим музыкальным плеером! 🎵