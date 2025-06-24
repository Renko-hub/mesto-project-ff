// index.js

// Импортируем необходимые модули
import "./index.css"; // Стили
import * as Api from "../components/api"; // Работа с API
import * as Card from "../components/card"; // Карточки
import * as Modal from "../components/modal"; // Модальные окна
import * as Validation from "../components/validation"; // Валидация форм

// Элементы интерфейса
const placesList = document.querySelector(".places__list"); // Контейнер карточек
const editPopup = document.querySelector(".popup.popup_type_edit"); // Поп-ап редактирования профиля
const addNewCardPopup = document.querySelector(".popup.popup_type_new-card"); // Поп-ап добавления новой карточки
const imageViewPopup = document.querySelector(".popup.popup_type_image"); // Поп-ап отображения полноразмерного изображения
const img = imageViewPopup.querySelector(".popup__image");
const caption = imageViewPopup.querySelector(".popup__caption");

// Формы
const editProfileForm = document.forms["edit-profile"]; // Форма редактирования профиля
const addNewPlaceForm = document.forms["new-place"]; // Форма добавления места
const changeAvatarForm = document.forms["change-avatar-form"]; // Форма изменения аватара

// Элементы профиля
const titleProfile = document.querySelector(".profile__title"); // Заголовок профиля
const descriptionProfile = document.querySelector(".profile__description"); // Описание профиля
const profileImage = document.querySelector(".profile__image"); // Изображение профиля

// Кнопки
const editProfileButton = document.querySelector(".profile__edit-button"); // Кнопка редактирования профиля
const addPlaceButton = document.querySelector(".profile__add-button"); // Кнопка добавления нового места
const avatarButton = document.querySelector(".profile__image"); // Кнопка изменения аватара

// Конфигурация валидации
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Точка входа приложения
Promise.all([Api.getUserInfo(), Api.getInitialCards()])
  .then(([userInfo, cards]) => {
    setUserProfile(userInfo);
    renderCards(cards, showFullscreenImage, userInfo._id);
  })
  .catch(console.error);

// Отрисовка начальных карточек
function renderCards(cards, clickHandler, userId) {
  cards.forEach((cardData) => {
    const cardElement = Card.createCard(cardData, clickHandler, userId);
    placesList.append(cardElement);
  });
}

// Показ полного изображения
function showFullscreenImage(src, alt) {
  img.src = src;
  img.alt = alt;
  caption.textContent = alt;
  Modal.openModal(imageViewPopup);
}

// Управление состоянием кнопки загрузки
function updateButtonState(button, isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Сохранение..." : "Сохранить";
  button.classList.toggle(validationConfig.inactiveButtonClass, isLoading);
}

// Открывает форму изменения аватара
function openChangeAvatarForm() {
  changeAvatarForm.reset();
  Validation.clearValidation(changeAvatarForm, validationConfig);
  Modal.openModal(document.querySelector(".popup.popup_type_change-avatar"));
}

// Основной обработчик отправки формы изменения аватара
function handleChangeAvatarSubmit(event) {
  event.preventDefault();
  const { link: avatarLink } = changeAvatarForm.elements;
  const submitButton = changeAvatarForm.querySelector(".popup__button");

  updateButtonState(submitButton, true);

  setTimeout(() => {
    Api.updateUserAvatar(avatarLink.value.trim())
      .then((updatedUserInfo) => {
        profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
        Modal.closeModal(
          document.querySelector(".popup.popup_type_change-avatar")
        );
      })
      .finally(() => {
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Настраивает профиль пользователя
function setUserProfile(userInfo) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
    profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
  }
}

// Открывает форму редактирования профиля пользователя
function openEditProfileForm() {
  editProfileForm.reset();
  Validation.clearValidation(editProfileForm, validationConfig);
  editProfileForm.name.value = titleProfile.textContent;
  editProfileForm.description.value = descriptionProfile.textContent;

  // Получаем массив всех полей формы
  const inputList = Array.from(
    editProfileForm.querySelectorAll(validationConfig.inputSelector)
  );
  // Получаем кнопку отправки формы
  const submitButton = editProfileForm.querySelector(
    validationConfig.submitButtonSelector
  );

  // Активируем кнопку "Сохранить", если все поля заполнены верно
  Validation.toggleButtonState({
    inputList,
    submitButtonElement: submitButton,
    inactiveButtonClass: validationConfig.inactiveButtonClass,
  });

  Modal.openModal(editPopup);
}

// Основная логика обработки отправленной формы редактирования профиля
function handleEditProfileSubmit(event) {
  event.preventDefault();
  const { name, description } = editProfileForm.elements;
  const submitButton = editProfileForm.querySelector(".popup__button");

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
      })
      .finally(() => {
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Открывает форму добавления карточки
function openAddCardForm() {
  addNewPlaceForm.reset();
  Validation.clearValidation(addNewPlaceForm, validationConfig);
  Modal.openModal(addNewCardPopup);
}

// Основной обработчик отправки формы добавления карточки
function handleAddCardSubmit(event) {
  event.preventDefault();
  const { "place-name": placeNameInput, link: linkInput } =
    addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector(".popup__button");

  updateButtonState(submitButton, true);

  setTimeout(() => {
    Api.createCard({
      name: placeNameInput.value.trim(),
      link: linkInput.value.trim(),
    })
      .then((newCard) => {
        const newCardElement = Card.createCard(
          newCard,
          showFullscreenImage,
          newCard.owner._id
        ); // Передаем новый ID пользователя
        placesList.prepend(newCardElement);
        Modal.closeModal(addNewCardPopup);
      })
      .finally(() => {
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Присваиваем обработчики событий
editProfileButton.addEventListener("pointerdown", openEditProfileForm);
addPlaceButton.addEventListener("pointerdown", openAddCardForm);
avatarButton.addEventListener("pointerdown", openChangeAvatarForm);

// Обработчики отправки форм
editProfileForm.addEventListener("submit", handleEditProfileSubmit);
addNewPlaceForm.addEventListener("submit", handleAddCardSubmit);
changeAvatarForm.addEventListener("submit", handleChangeAvatarSubmit);

// Включаем проверку форм
Validation.enableValidation(validationConfig);

// Закрываем модальные окна
document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("pointerdown", (evt) => {
    if (evt.target === popup || evt.target.classList.contains("popup__close")) {
      Modal.closeModal(popup);
    }
  });
});
