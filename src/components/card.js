// card.js

// Импортируем модуль API
import * as Api from './api';

// Кэшируем шаблон карточки
const cardTemplate = document.querySelector('#card-template');

// Основные функции создания карточек
function createCard({ name, link, likes, _id, owner }, onClick, currentUserId) {
  // Создает новую карточку и возвращает её элемент DOM
  const element = cardTemplate.content.cloneNode(true).firstElementChild;
  const imageCard = element.querySelector('.card__image');
  const titleCard = element.querySelector('.card__title');
  const likeButton = element.querySelector('.card__like-button');
  const deleteButton = element.querySelector('.card__delete-button');
  const likeCounterSpan = element.querySelector('.card__like-counter');

  // Обработчик ошибок загрузки изображений
  imageCard.onerror = () => handleImageLoadError(element);

  // Базовые настройки элементов карточки
  element.dataset.id = _id;
  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Установка начального состояния количества лайков
  const initialLikesCount = Array.isArray(likes) ? likes.length : 0;
  setInitialLikeStatus(initialLikesCount, likeCounterSpan);

  // Определение владельца карточки
  const isOwner = owner._id === currentUserId;
  deleteButton.classList.toggle('card__delete-button_is-active', isOwner);

  // Определять статус текущего пользователя относительно лайка
  const alreadyLiked = isCardLiked(_id);
  likeButton.classList.toggle('card__like-button_is-active', alreadyLiked);

  // Добавляем обработчики кликов
  imageCard.addEventListener('click', () => onClick(link, name));
  likeButton.addEventListener('click', () =>
    toggleLike(_id, likeButton, likeCounterSpan, currentUserId)
  );

  return element;
}

// Функции управления состоянием лайков
function updateUIOnLike(buttonElement, counterElement, liked) {
  // Обновляет интерфейс после изменения состояния лайка
  buttonElement.classList.toggle('card__like-button_is-active', liked);
  liked ? incrementLikeCounter(counterElement) : decrementLikeCounter(counterElement);
}

function setInitialLikeStatus(count, counterElement) {
  // Устанавливает начальное количество лайков
  if (count > 0) {
    counterElement.textContent = count.toString();
    counterElement.classList.add('card__like-counter_is-active');
  } else {
    counterElement.classList.add('hidden');
  }
}

function incrementLikeCounter(counterElement) {
  // Увеличивает значение счетчика лайков
  const currentCount = Number(counterElement.textContent) || 0;
  counterElement.textContent = `${currentCount + 1}`;
  counterElement.classList.add('card__like-counter_is-active');
  counterElement.classList.remove('hidden');
}

function decrementLikeCounter(counterElement) {
  // Уменьшает значение счетчика лайков
  const currentCount = Number(counterElement.textContent) || 0;
  if (currentCount <= 1) {
    counterElement.textContent = '';
    counterElement.classList.add('hidden');
    counterElement.classList.remove('card__like-counter_is-active');
  } else {
    counterElement.textContent = `${currentCount - 1}`;
  }
}

function toggleLike(cardId, buttonElement, counterElement, currentUserId) {
  // Переключает состояние лайка и обновляет UI
  return new Promise((resolve) => {
    const wasLikedBefore = buttonElement.classList.contains('card__like-button_is-active');
    const action = wasLikedBefore ? 'unLike' : 'like';
    const apiAction = wasLikedBefore ? Api.unLikeCard : Api.likeCard;

    apiAction(cardId)
      .then(() => {
        saveLikeState(cardId, !wasLikedBefore); // сохраняет новое состояние
        resolve(!wasLikedBefore);
      });
  })
    .then((isNowLiked) => {
      updateUIOnLike(buttonElement, counterElement, isNowLiked);
    });
}

// Хранение состояний лайков в Local Storage
function saveLikeState(cardId, state) {
  // Сохраняет текущее состояние лайка в локальном хранилище
  let likedCards = JSON.parse(localStorage.getItem('likedCards')) || [];

  if (state && !likedCards.includes(cardId)) likedCards.push(cardId);
  else likedCards = likedCards.filter((id) => id !== cardId);

  localStorage.setItem('likedCards', JSON.stringify(likedCards));
}

function isCardLiked(cardId) {
  // Определяет, понравилась ли карточка ранее
  const likedCards = JSON.parse(localStorage.getItem('likedCards')) || [];
  return likedCards.includes(cardId);
}

// Вспомогательные функции обработки ошибок
function handleImageLoadError(cardElement) {
  cardElement.classList.add('card__image-error');

  ['.card__description', '.card__like-counter'].forEach((selector) => {
    const targetElement = cardElement.querySelector(selector);
    if (targetElement) targetElement.style.display = 'none';
  });
}

// Экспортируемые функции
export { createCard, toggleLike };