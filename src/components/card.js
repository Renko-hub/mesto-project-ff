// card.js

// Импортируем модуль API
import * as Api from "./api";

// Кэшируем шаблон карточки
const cardTemplate = document.querySelector("#card-template");

// Главная функция создания карточки
function createCard({ name, link, likes, _id, owner }, onClick, currentUserId) {
  // Получаем элементы шаблона
  const element = cardTemplate.content.cloneNode(true).firstElementChild;
  const imageCard = element.querySelector(".card__image");
  const titleCard = element.querySelector(".card__title");
  const likeButton = element.querySelector(".card__like-button");
  const deleteButton = element.querySelector(".card__delete-button");
  const likeCounterSpan = element.querySelector(".card__like-counter");

  // Обработка ошибок загрузки картинки
  imageCard.onerror = () => handleImageLoadError(element);

  // Настройка элемента изображения и заголовка
  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Начальное состояние количества лайков
  const initialLikesCount = Array.isArray(likes) ? likes.length : 0;
  setInitialLikeStatus(initialLikesCount, likeCounterSpan);

  // Скрываем или показываем кнопку удаления в зависимости от владельца
  const isOwner = owner._id === currentUserId;
  deleteButton.classList.toggle("card__delete-button_is-active", isOwner);

  // Проверка, поставил ли текущий пользователь лайк
  const alreadyLiked = checkIfUserLiked(currentUserId, likes);
  likeButton.classList.toggle("card__like-button_is-active", alreadyLiked);

  // Назначаем события кликов
  imageCard.addEventListener("pointerdown", () => onClick(link, name));
  likeButton.addEventListener("pointerdown", () =>
    toggleLike(_id, likeButton, likeCounterSpan, currentUserId)
  );
  deleteButton.addEventListener("pointerdown", () => removeCard(_id, element));

  return element;
}

// Переключение состояния лайка
function toggleLike(cardId, buttonElement, counterElement, currentUserId) {
  const wasLikedBefore = buttonElement.classList.contains(
    "card__like-button_is-active"
  );
  const action = wasLikedBefore ? "unLike" : "like";
  const apiAction = wasLikedBefore ? Api.unLikeCard : Api.likeCard;

  apiAction(cardId)
    .then(() => {
      updateUIOnLike(buttonElement, counterElement, !wasLikedBefore);
    })
    .catch((error) => {
      console.error(`Ошибка переключения лайка: ${error}`);
    });
}

// Обновление UI после изменения состояния лайка
function updateUIOnLike(buttonElement, counterElement, liked) {
  buttonElement.classList.toggle("card__like-button_is-active", liked);
  liked
    ? incrementLikeCounter(counterElement)
    : decrementLikeCounter(counterElement);
}

// Устанавливаем начальное значение счётчика лайков
function setInitialLikeStatus(count, counterElement) {
  if (count > 0) {
    counterElement.textContent = count.toString();
    counterElement.classList.add("card__like-counter_is-active");
  } else {
    counterElement.classList.add("hidden");
  }
}

// Инкрементируем счётчик лайков
function incrementLikeCounter(counterElement) {
  const currentCount = Number(counterElement.textContent) || 0;
  counterElement.textContent = `${currentCount + 1}`;
  counterElement.classList.add("card__like-counter_is-active");
  counterElement.classList.remove("hidden");
}

// Декрементируем счётчик лайков
function decrementLikeCounter(counterElement) {
  const currentCount = Number(counterElement.textContent) || 0;
  if (currentCount <= 1) {
    counterElement.textContent = "";
    counterElement.classList.add("hidden");
    counterElement.classList.remove("card__like-counter_is-active");
  } else {
    counterElement.textContent = `${currentCount - 1}`;
  }
}

// Проверяет, лайкнул ли пользователь карточку
function checkIfUserLiked(currentUserId, likes) {
  return likes.some((like) => like._id === currentUserId);
}

// Удаляет карточку без подтверждения
function removeCard(cardId, element) {
  Api.deleteCard(cardId)
    .then(() => {
      element.remove(); // Удаляем элемент из DOM
    })
    .catch((err) => {
      console.error(`Ошибка удаления карточки: ${err}`);
    });
}

// Обрабатывает ошибку загрузки изображения
function handleImageLoadError(cardElement) {
  cardElement.classList.add("card__image-error");
  [".card__description", ".card__like-counter"].forEach((selector) => {
    const targetElement = cardElement.querySelector(selector);
    if (targetElement) targetElement.style.display = "none";
  });
}

// Экспорт главной функции
export { createCard };
