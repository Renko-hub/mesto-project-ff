// api.js

// Базовая конфигурация API
const CONFIG = {
  baseUrl: 'https://nomoreparties.co/v1/wff-cohort-40',
  headers: {
    authorization: '58e71842-fa9b-43bb-ae0e-cc1c7d460c64',
    'Content-Type': 'application/json'
  },
};

// Обрабатывает HTTP-ответы сервера
const handleResponse = (response) => {
  if (response.ok) {
    return response.json(); // преобразуем тело ответа в JSON
  } else {
    throw new Error(`Ошибка сервера (${response.status}): ${response.statusText}`); // выбрасываем ошибку при неудачном статусе
  }
};

// Выполняет основной запрос к серверу с использованием Promises
const request = (url, options) =>
  fetch(url, options)
    .then(handleResponse)
    .catch((err) => {
      throw err; // повторно бросаем исключение вверх по стеку
    });

// Возвращает информацию о текущем авторизованном пользователе
const getUserInfo = () => request(`${CONFIG.baseUrl}/users/me`, { headers: CONFIG.headers });

// Загружает начальные данные карточек с сервера
const getInitialCards = () => request(`${CONFIG.baseUrl}/cards`, { headers: CONFIG.headers });

// Получает одну конкретную карточку по идентификатору
const getCardById = (id) => request(`${CONFIG.baseUrl}/cards/${id}`, { headers: CONFIG.headers });

// Создаёт новую карточку на сервере
const createCard = ({ name, link }) => request(`${CONFIG.baseUrl}/cards`, {
  headers: CONFIG.headers,
  method: 'POST',
  body: JSON.stringify({ name, link }),
});

// Обновляет информацию профиля пользователя
const updateUserInfo = ({ name, about }) => request(`${CONFIG.baseUrl}/users/me`, {
  headers: CONFIG.headers,
  method: 'PATCH',
  body: JSON.stringify({ name, about }),
});

// Обновляет аватар пользователя
const updateUserAvatar = (link) => request(`${CONFIG.baseUrl}/users/me/avatar`, {
  headers: CONFIG.headers,
  method: 'PATCH',
  body: JSON.stringify({ avatar: link }),
});

// Удаляет карточку с сервера
const deleteCard = (id) => request(`${CONFIG.baseUrl}/cards/${id}`, {
  headers: CONFIG.headers,
  method: 'DELETE',
});

// Лайкает карточку
const likeCard = (id) => request(`${CONFIG.baseUrl}/cards/${id}/likes`, {
  headers: CONFIG.headers,
  method: 'PUT',
});

// Снимает лайк с карточки
const unLikeCard = (id) => request(`${CONFIG.baseUrl}/cards/${id}/likes`, {
  headers: CONFIG.headers,
  method: 'DELETE',
});

// Групповой экспорт всех функций
export {
  getUserInfo,
  getInitialCards,
  getCardById,
  createCard,
  updateUserInfo,
  updateUserAvatar,
  deleteCard,
  likeCard,
  unLikeCard
};