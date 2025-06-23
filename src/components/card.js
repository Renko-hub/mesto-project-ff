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

  // Настройки элементов карточки
  element.dataset.id = _id; // Этот атрибут только для удобства выборки карточки при удалении
  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Начальное количество лайков
  const initialLikesCount = Array.isArray(likes) ? likes.length : 0;
  setInitialLikeStatus(initialLikesCount, likeCounterSpan);

  // Если владелец карточки совпадает с текущим пользователем
  const isOwner = owner._id === currentUserId;
  deleteButton.classList.toggle("card__delete-button_is-active", isOwner);

  // Проверка, понравился ли пост этому пользователю
  const alreadyLiked = isCardLiked(_id);
  likeButton.classList.toggle("card__like-button_is-active", alreadyLiked);

  // Добавляем события кликов
  imageCard.addEventListener("pointerdown", () => onClick(link, name));
  likeButton.addEventListener("pointerdown", () =>
    toggleLike(_id, likeButton, likeCounterSpan, currentUserId)
  );

  // Слушатель события удаления передан прямо при объявлении
  deleteButton.addEventListener("pointerdown", () =>
    openDeleteConfirmation(_id)
  );

  return element;
}

// Открытие модального окна подтверждения удаления
function openDeleteConfirmation(cardId) {
  const deleteConfirmPopup = document.querySelector(
    ".popup.popup_type_delete-confirm"
  );
  Modal.openModal(deleteConfirmPopup);

  // Передаем карту в качестве параметра в обработчик подтверждения
  document
    .querySelector(".popup.popup_type_delete-confirm .popup__button_confirm")
    .addEventListener("click", () => confirmDeletion(cardId), { once: true });
}

// Подтверждение удаления карточки
function confirmDeletion(cardId) {
  Api.deleteCard(cardId)
    .then(() => {
      const cardElement = document.querySelector(`[data-id="${cardId}"]`);
      if (cardElement) cardElement.remove();
      Modal.closeModal(
        document.querySelector(".popup.popup_type_delete-confirm")
      );
    })
    .catch((err) => console.error(`Ошибка удаления карточки ${cardId}:`, err));
}

// Переключение состояния лайка
function toggleLike(cardId, buttonElement, counterElement, currentUserId) {
  return new Promise((resolve) => {
    const wasLikedBefore = buttonElement.classList.contains(
      "card__like-button_is-active"
    );
    const action = wasLikedBefore ? "unLike" : "like";
    const apiAction = wasLikedBefore ? Api.unLikeCard : Api.likeCard;

    apiAction(cardId)
      .then(() => {
        saveLikeState(cardId, !wasLikedBefore);
        resolve(!wasLikedBefore);
      })
      .catch((error) => console.error(`Ошибка переключения лайка: ${error}`));
  }).then((isNowLiked) => {
    updateUIOnLike(buttonElement, counterElement, isNowLiked);
  });
}

// Обновление интерфейса после смены состояния лайка
function updateUIOnLike(buttonElement, counterElement, liked) {
  buttonElement.classList.toggle("card__like-button_is-active", liked);
  liked
    ? incrementLikeCounter(counterElement)
    : decrementLikeCounter(counterElement);
}

// Инициализация отображения числа лайков
function setInitialLikeStatus(count, counterElement) {
  if (count > 0) {
    counterElement.textContent = count.toString();
    counterElement.classList.add("card__like-counter_is-active");
  } else {
    counterElement.classList.add("hidden");
  }
}

// Инкрементация счётчика лайков
function incrementLikeCounter(counterElement) {
  const currentCount = Number(counterElement.textContent) || 0;
  counterElement.textContent = `${currentCount + 1}`;
  counterElement.classList.add("card__like-counter_is-active");
  counterElement.classList.remove("hidden");
}

// Декрементация счётчика лайков
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

// Хранение состояния лайков в Local Storage
function saveLikeState(cardId, state) {
  let likedCards = JSON.parse(localStorage.getItem("likedCards")) || {};
  likedCards[cardId] = state;
  localStorage.setItem("likedCards", JSON.stringify(likedCards));
}

// Проверка наличия лайка у карты
function isCardLiked(cardId) {
  const likedCards = JSON.parse(localStorage.getItem("likedCards")) || {};
  return !!likedCards[cardId];
}

// Обработка ошибки загрузки изображения
function handleImageLoadError(cardElement) {
  cardElement.classList.add("card__image-error");
  [".card__description", ".card__like-counter"].forEach((selector) => {
    const targetElement = cardElement.querySelector(selector);
    if (targetElement) targetElement.style.display = "none";
  });
}

// Экспорт нужной функции
export { createCard };
