const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем запросы с других доменов
app.use(cors());
app.use(express.json());

// Подключаемся к базе данных (файл создастся автоматически)
const dbPath = path.join(__dirname, '../database', 'posts.db');
const db = new sqlite3.Database(dbPath);

// Создаём таблицу для постов, если её нет
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);
  console.log('✅ База данных готова');
});

// 📥 ПОЛУЧИТЬ все посты
app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 📤 СОЗДАТЬ новый пост
app.post('/api/posts', (req, res) => {
  const { name, text } = req.body;
  
  // Проверяем, что данные есть
  if (!name || !text) {
    return res.status(400).json({ error: 'Имя и текст обязательны' });
  }

  const date = new Date().toLocaleString('ru-RU');
  
  db.run(
    'INSERT INTO posts (name, text, date) VALUES (?, ?, ?)',
    [name, text, date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Возвращаем созданный пост вместе с ID
      res.status(201).json({
        id: this.lastID,
        name,
        text,
        date
      });
    }
  );
});

// Для локального запуска
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  });
}

// Экспортируем для Vercel (обязательно!)
module.exports = app;