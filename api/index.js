const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// СОЗДАЁМ БАЗУ В ПАМЯТИ (не сохраняется на диск)
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);
  console.log('✅ База данных в памяти создана');
});

app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/posts', (req, res) => {
  const { name, text } = req.body;
  
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
      
      res.status(201).json({
        id: this.lastID,
        name,
        text,
        date
      });
    }
  );
});

module.exports = app;
