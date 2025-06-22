// index.js

// Импортируем необходимые модули
import "./index.css"; // Стили
import * as Api from "../components/api"; // Работа с API
import * as Card from "../components/card"; // Карточки
import * as Modal from "../components/modal"; // Модальные окна
import * as Validation from "../components/validation"; // Валидация форм

// Конфигурация валидации
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Интерфейсные элементы
const placesList = document.querySelector(".places__list"); // Контейнер карточек
const editPopup = document.querySelector(".popup.popup_type_edit"); // Окно редактирования профиля
const addNewCardPopup = document.querySelector(".popup.popup_type_new-card"); // Окно добавления карточки
const imageViewPopup = document.querySelector(".popup.popup_type_image"); // Окно просмотра картинки
const img = imageViewPopup.querySelector(".popup__image");
const caption = imageViewPopup.querySelector(".popup__caption");
const deleteConfirmPopup = document.querySelector(
  ".popup.popup_type_delete-confirm"
); // Окно подтверждения удаления

// Формы
const editProfileForm = document.forms["edit-profile"]; // Форма редактирования профиля
const addNewPlaceForm = document.forms["new-place"]; // Форма добавления нового места
const changeAvatarForm = document.forms["change-avatar-form"]; // Форма изменения аватара

// Профильные элементы
const titleProfile = document.querySelector(".profile__title"); // Имя профиля
const descriptionProfile = document.querySelector(".profile__description"); // Описание профиля
const profileImage = document.querySelector(".profile__image"); // Аватар профиля

// Кнопки
const editProfileButton = document.querySelector(".profile__edit-button"); // Кнопка редактирования профиля
const addPlaceButton = document.querySelector(".profile__add-button"); // Кнопка добавления карточки
const avatarButton = document.querySelector(".profile__image"); // Кнопка изменения аватара

// Глобальная переменная для хранения карточек
let cardsStorage = {};

// Вспомогательные функции

// Показ большого изображения
function showFullscreenImage(src, alt) {
  img.src = src;
  img.alt = alt;
  caption.textContent = alt;
  Modal.openModal(imageViewPopup);
}

// Установка данных профиля
function setUserProfile(userInfo) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
    profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
  }
}

// Рендеринг карточек
function renderCards(cards, clickHandler, userId) {
  cards.forEach((cardData) => {
    const cardElement = createCard(cardData, clickHandler, userId);
    placesList.append(cardElement);
  });
}

// Изменение состояния кнопки при отправке формы
function updateButtonState(button, loading) {
  button.disabled = loading;
  button.textContent = loading ? "Сохранение..." : "Сохранить";
  button.classList.toggle(validationConfig.inactiveButtonClass, loading);
}

// Полный сброс формы
function resetForm(form) {
  form.reset();
  Validation.clearValidation(form, validationConfig);
}

// Подтверждение удаления карточки
function openDeleteConfirmationModal(cardId) {
  deleteConfirmPopup.addEventListener(
    "pointerdown",
    (evt) => {
      if (evt.target.classList.contains("popup__button_confirm")) {
        evt.preventDefault();
        performCardDeletion(cardId);
      }
    },
    { once: true }
  );

  Modal.openModal(deleteConfirmPopup);
}

// Удаление карточки
function performCardDeletion(cardId) {
  Api.deleteCard(cardId)
    .then(() => {
      const cardElement = cardsStorage[cardId];
      if (cardElement) {
        cardElement.remove();
        delete cardsStorage[cardId];
      }
      Modal.closeModal(deleteConfirmPopup);
    })
    .catch(console.error);
}

// Клик по кнопке удаления
function onDeleteButtonClick(cardId) {
  openDeleteConfirmationModal(cardId);
}

// Создание карточки с правильным привязыванием события удаления
function createCard(cardData, clickHandler, userId) {
  const cardElement = Card.createCard(cardData, clickHandler, userId);
  cardsStorage[cardData._id] = cardElement;

  cardElement
    .querySelector(".card__delete-button")
    .addEventListener("click", () => {
      onDeleteButtonClick(cardData._id);
    });

  return cardElement;
}

// Открытие формы редактирования профиля
function openEditProfileForm() {
  resetForm(editProfileForm);
  editProfileForm.name.value = titleProfile.textContent;
  editProfileForm.description.value = descriptionProfile.textContent;

  const submitButton = editProfileForm.querySelector(
    '.popup__button[type="submit"]'
  );
  submitButton.disabled = false;
  submitButton.classList.remove(validationConfig.inactiveButtonClass);

  Modal.openModal(editPopup);
}

// Открытие формы изменения аватара
function openChangeAvatarForm() {
  resetForm(changeAvatarForm);
  Modal.openModal(document.querySelector(".popup.popup_type_change-avatar"));
}

// Открытие формы добавления карточки
function openAddCardForm() {
  resetForm(addNewPlaceForm);
  Modal.openModal(addNewCardPopup);
}

// Обработчик отправки формы редактирования профиля
function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const { name, description } = editProfileForm.elements;
  const submitButton = editProfileForm.querySelector(
    '.popup__button[type="submit"]'
  );

  updateButtonState(submitButton, true);
  setTimeout(() => {
    Api.updateUserInfo({
      name: name.value.trim(),
      about: description.value.trim(),
    })
      .then((updatedUserInfo) => {
        titleProfile.textContent = updatedUserInfo.name;
        descriptionProfile.textContent = updatedUserInfo.about;
        Modal.closeModal(editPopup);
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Обработчик отправки формы добавления карточки
function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const { "place-name": placeNameInput, link: linkInput } =
    addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector(
    '.popup__button[type="submit"]'
  );

  updateButtonState(submitButton, true);
  setTimeout(() => {
    Api.createCard({
      name: placeNameInput.value.trim(),
      link: linkInput.value.trim(),
    })
      .then((newCard) => {
        const newCardElement = createCard(
          newCard,
          showFullscreenImage,
          newCard.owner._id
        );
        cardsStorage[newCard._id] = newCardElement;
        placesList.prepend(newCardElement);
        Modal.closeModal(addNewCardPopup);
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Обработчик отправки формы изменения аватара
function handleChangeAvatarSubmit(evt) {
  evt.preventDefault();
  const { link: avatarLink } = changeAvatarForm.elements;
  const submitButton = changeAvatarForm.querySelector(
    '.popup__button[type="submit"]'
  );

  updateButtonState(submitButton, true);
  setTimeout(() => {
    Api.updateUserAvatar(avatarLink.value.trim())
      .then((updatedUserInfo) => {
        profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
        Modal.closeModal(
          document.querySelector(".popup.popup_type_change-avatar")
        );
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Главный загрузочный блок
Promise.all([Api.getUserInfo(), Api.getInitialCards()])
  .then(([userInfo, cards]) => {
    setUserProfile(userInfo);
    renderCards(cards, showFullscreenImage, userInfo._id);
  })
  .catch(console.error);

// ------- НАЗНАЧЕНИЕ ОБРАБОТЧИКОВ СОБЫТИЙ -------

// Открытие формы редактирования профиля
editProfileButton.addEventListener("pointerdown", openEditProfileForm);

// Открытие формы добавления карточки
addPlaceButton.addEventListener("pointerdown", openAddCardForm);

// Открытие формы изменения аватара
avatarButton.addEventListener("pointerdown", openChangeAvatarForm);

// Отправка формы редактирования профиля
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// Отправка формы добавления карточки
addNewPlaceForm.addEventListener("submit", handleAddCardSubmit);

// Отправка формы изменения аватара
changeAvatarForm.addEventListener("submit", handleChangeAvatarSubmit);

// Закрытие модальных окон
document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("pointerdown", (evt) => {
    if (evt.target === popup || evt.target.classList.contains("popup__close")) {
      Modal.closeModal(popup);
    }
  });
});

// ------ ИНИЦИАЛИЗАЦИЯ ВАЛИДАЦИИ -----
Validation.enableValidation(validationConfig);
