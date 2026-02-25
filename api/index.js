const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Путь к файлу с постами (используем /tmp, так как туда можно писать на Vercel)
const DATA_FILE = path.join('/tmp', 'posts.json');

// Функция для чтения постов
function readPosts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Если файла нет, создаём с пустым массивом
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения файла:', error);
    return [];
  }
}

// Функция для записи постов
function writePosts(posts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    return true;
  } catch (error) {
    console.error('Ошибка записи файла:', error);
    return false;
  }
}

// ===== МАРШРУТЫ =====

// Получить все посты
app.get('/api/posts', (req, res) => {
  const posts = readPosts();
  // Отправляем в обратном порядке (новые сверху)
  res.json(posts.reverse());
});

// Создать новый пост
app.post('/api/posts', (req, res) => {
  const { name, text } = req.body;
  
  // Проверяем, что данные есть
  if (!text) {
    return res.status(400).json({ error: 'Текст поста обязателен' });
  }

  // Читаем текущие посты
  const posts = readPosts();
  
  // Создаём новый пост
  const newPost = {
    id: Date.now(), // уникальный ID на основе времени
    name: name?.trim() || 'Аноним',
    text: text.trim(),
    date: new Date().toLocaleString('ru-RU')
  };

  // Добавляем в массив
  posts.push(newPost);
  
  // Сохраняем
  if (writePosts(posts)) {
    res.status(201).json(newPost);
  } else {
    res.status(500).json({ error: 'Не удалось сохранить пост' });
  }
});

module.exports = app;
