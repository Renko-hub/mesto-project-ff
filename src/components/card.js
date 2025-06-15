// card.js

// Импортируем модуль API
import * as Api from './api';

// Кэшируем шаблон карточки
const cardTemplate = document.querySelector('#card-template');

// Функция для обработки ошибок загрузки изображения
function handleImageLoadError(element) {
  element.classList.add('card__image-error');

  // Удаляем лишнюю разметку
  ['.card__description', '.card__like-counter'].forEach(selector => {
    const el = element.querySelector(selector);
    if (el) el.remove();
  });
}

// Функция для проверки наличия лайка в localStorage
function isCardLiked(cardId) {
  const likedCards = JSON.parse(localStorage.getItem('likedCards')) || [];
  return likedCards.includes(cardId);
}

// Функция для сохранения состояния лайка в localStorage
function saveLikeState(cardId, state) {
  let likedCards = JSON.parse(localStorage.getItem('likedCards')) || [];

  if (state) {
    if (!likedCards.includes(cardId)) likedCards.push(cardId);
  } else {
    likedCards = likedCards.filter(id => id !== cardId);
  }

  localStorage.setItem('likedCards', JSON.stringify(likedCards));
}

// Функция создания карточки с интерактивностью
function createCard({ name, link, likes, _id, owner }, onClick, currentUserId) {
  const element = cardTemplate.content.cloneNode(true).firstElementChild;
  const imageCard = element.querySelector('.card__image');
  const titleCard = element.querySelector('.card__title');
  const likeButton = element.querySelector('.card__like-button');
  const deleteButton = element.querySelector('.card__delete-button');

  // Обработчик ошибок загрузки изображения
  imageCard.onerror = () => handleImageLoadError(element);

  // Устанавливаем базовые свойства
  element.dataset.id = _id;
  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Работаем с лайками
  const likeCounterSpan = element.querySelector('.card__like-counter');
  const initialLikesCount = Array.isArray(likes) ? likes.length : 0;

  if (initialLikesCount > 0) {
    likeCounterSpan.textContent = `${initialLikesCount}`;
    likeCounterSpan.classList.add('card__like-counter_is-active');
  } else {
    likeCounterSpan.classList.add('hidden');
  }

  // Возможность удалять карточку владельцу
  const isOwner = owner._id === currentUserId;
  if (isOwner) {
    deleteButton.classList.add('card__delete-button_is-active');
  } else {
    deleteButton.classList.remove('card__delete-button_is-active');
  }

  // Установка текущего состояния лайка
  const alreadyLiked = isCardLiked(_id);
  if (alreadyLiked) {
    likeButton.classList.add('card__like-button_is-active');
  } else {
    likeButton.classList.remove('card__like-button_is-active');
  }

  // Обработчики событий
  imageCard.addEventListener('click', () => onClick(link, name));
  likeButton.addEventListener('click', () =>
    toggleLike(_id, likeButton, likeCounterSpan, currentUserId)
  );

  return element;
}

// Переключатель лайка
function toggleLike(cardId, buttonElement, counterElement, currentUserId) {
  return new Promise(resolve => {
    const wasLikedBefore = buttonElement.classList.contains('card__like-button_is-active');

    if (wasLikedBefore) {
      Api.unLikeCard(cardId)
        .then(() => {
          saveLikeState(cardId, false);
          resolve(false);
        })
        .catch(() => {});
    } else {
      Api.likeCard(cardId)
        .then(() => {
          saveLikeState(cardId, true);
          resolve(true);
        })
        .catch(() => {});
    }
  }).then(isNowLiked => {
    updateUIOnLike(buttonElement, counterElement, isNowLiked);
  });
}

// Обновление интерфейса после изменения состояния лайка
function updateUIOnLike(buttonElement, counterElement, liked) {
  buttonElement.classList.toggle('card__like-button_is-active', liked);

  if (liked) {
    const currentCount = Number(counterElement.textContent) || 0;
    counterElement.textContent = `${currentCount + 1}`;
    counterElement.classList.add('card__like-counter_is-active');
    counterElement.classList.remove('hidden');
  } else {
    const currentCount = Number(counterElement.textContent) || 0;
    if (currentCount <= 1) {
      counterElement.textContent = '';
      counterElement.classList.add('hidden');
      counterElement.classList.remove('card__like-counter_is-active');
    } else {
      counterElement.textContent = `${currentCount - 1}`;
    }
  }
}

// Экспорт необходимых функций
export { createCard, toggleLike };