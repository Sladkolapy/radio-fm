const fs = require('fs');
const path = require('path');

console.log('🎨 Setting up initial project structure...');

const structure = {
  'backend/.env': `PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`,
  'backend/README.md': `# PingMusic Backend

API сервер для музыкального плеера с локальным хранилищем файлов.

## Структура

- /config - конфигурация базы данных и multer
- /controllers - обработчики запросов
- /middleware - middleware для авторизации и загрузки файлов
- /routes - API роуты
- /uploads - загруженные файлы
- /database - база данных SQLite

## API Endpoints

### Авторизация
- POST /api/auth/register - регистрация
- POST /api/auth/login - вход
- GET /api/auth/profile - получить профиль (требуется токен)

### Треки
- GET /api/tracks - публичный список треков
- GET /api/tracks/:id - информация о треке
- GET /api/tracks/private - приватные треки пользователя (требуется токен)
- POST /api/tracks - создать трек (требуется токен)
- PUT /api/tracks/:id - обновить трек (требуется токен)
- DELETE /api/tracks/:id - удалить трек (требуется токен)
- GET /api/admin/tracks - админ панель (требуется токен)`,

  'frontend/README.md': `# PingMusic Frontend

React + TypeScript + Vite музыкальный плеер.

## Установка

\`\`\`bash
npm install
\`\`\`

## Запуск

\`\`\`bash
npm run dev      # Development mode
npm run build    # Production build
npm run preview  # Preview production build
\`\`\`

## Функциональность

- Авторизация и регистрация пользователей
- Библиотека треков с поиском
- Музыкальный плеер с прогресс-баром и управлением воспроизведением
- Mood selector для выбора настроения треков
- Создание, редактирование и удаление треков (для авторизованных пользователей)
- Админ панель для управления всеми треками`,

  'API_DOCUMENTATION.md': `# API Documentation

Музыкальный плеер API документация.

**Базовый URL:** http://localhost:3000/api

## Статус коды

- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error`
};

Object.entries(structure).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content);
  console.log(`✅ Created ${filePath}`);
});

console.log('\n🎉 Initial project setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start backend: cd backend && npm run dev');
console.log('3. Start frontend: cd frontend && npm run dev');