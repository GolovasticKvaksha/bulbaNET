const API_URL = 'https://bulba-net.vercel.app/api';

// ===== 2. ПОТОМ функции =====

// Загружаем посты при загрузке страницы
window.onload = async function() {
  await loadPosts();
};

// Функция загрузки постов с сервера
async function loadPosts() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();
    
    const newsFeed = document.getElementById('newsFeed');
    newsFeed.innerHTML = ''; // Очищаем
    
    posts.forEach(post => {
      const postElement = createPostElement(post);
      newsFeed.appendChild(postElement);
    });
  } catch (error) {
    console.error('Ошибка загрузки постов:', error);
  }
}

// Функция создания элемента поста
function createPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.innerHTML = `
    <div style="font-weight: bold; color: #00fff9; margin-bottom: 5px;">${post.name}</div>
    <p style="margin: 0 0 10px 0;">${post.text}</p>
    <div class="post-date">${post.date}</div>
  `;
  return postElement;
}

// Функция добавления нового поста
async function addPost() {
  const nameInput = document.getElementById('nameInput');
  const postInput = document.getElementById('postInput');
  
  const name = nameInput.value.trim() || 'Аноним';
  const text = postInput.value.trim();
  
  if (!text) {
    alert('Напиши что-нибудь!');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, text })
    });
    
    if (!response.ok) {
      throw new Error('Ошибка сохранения');
    }
    
    const newPost = await response.json();
    
    // Добавляем новый пост в начало списка
    const newsFeed = document.getElementById('newsFeed');
    const postElement = createPostElement(newPost);
    newsFeed.insertBefore(postElement, newsFeed.firstChild);
    
    // Очищаем поле ввода
    postInput.value = '';
    
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось опубликовать пост');
  }

}
