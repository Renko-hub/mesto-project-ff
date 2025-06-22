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
const deleteConfirmPopup = document.querySelector(
  ".popup.popup_type_delete-confirm"
); // Подтверждение удаления карточки

// Формы
const editProfileForm = document.forms["edit-profile"];
const addNewPlaceForm = document.forms["new-place"];
const changeAvatarForm = document.forms["change-avatar-form"];

// Элементы профиля
const titleProfile = document.querySelector(".profile__title");
const descriptionProfile = document.querySelector(".profile__description");
const profileImage = document.querySelector(".profile__image");

// Кнопки
const editProfileButton = document.querySelector(".profile__edit-button");
const addPlaceButton = document.querySelector(".profile__add-button");
const avatarButton = document.querySelector(".profile__image");

// Конфигурация валидации
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Вспомогательные структуры данных
let cardsStorage = {}; // Здесь хранятся созданные карточки
let currentDeletingCardId = null; // Идентификатор текущей удаляемой карточки

// Просто генерирует карточку, ничего другого не делает
function generateCard(cardData, clickHandler, userId) {
  return Card.createCard(cardData, clickHandler, userId);
}

// Создаем карточку и дополнительно прикрепляем обработчик удаления
function createAndSetupCard(cardData, clickHandler, userId) {
  const cardElement = generateCard(cardData, clickHandler, userId);
  cardsStorage[cardData._id] = cardElement;

  // Устанавливаем обработчик события удаления
  cardElement
    .querySelector(".card__delete-button")
    .addEventListener("click", () => {
      handleDeleteButtonClick(cardData._id);
    });

  return cardElement;
}

// Логика показа полного изображения
function showFullscreenImage(src, alt) {
  img.src = src;
  img.alt = alt;
  caption.textContent = alt;
  Modal.openModal(imageViewPopup);
}

// Настройка профиля пользователя
function setUserProfile(userInfo) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
    profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
  }
}

// Рендеринг карточек
function renderCards(cards, clickHandler, userId) {
  cards.forEach((cardData) =>
    placesList.append(createAndSetupCard(cardData, clickHandler, userId))
  );
}

// Управляет состоянием кнопки при загрузке
function updateButtonState(button, isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Сохранение..." : "Сохранить";
  button.classList.toggle(validationConfig.inactiveButtonClass, isLoading);
}

// Сброс формы и очистка полей
function resetForm(form) {
  form.reset();
  Validation.clearValidation(form, validationConfig);
}

// Удаляет карточку с сервера и интерфейс
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
    .catch((err) => console.error(`Ошибка удаления карточки ${cardId}:`, err));
}

// Действия при открытии формы редактирования профиля
function openEditProfileForm() {
  resetForm(editProfileForm);
  editProfileForm.name.value = titleProfile.textContent;
  editProfileForm.description.value = descriptionProfile.textContent;

  const submitButton = editProfileForm.querySelector(".popup__button");
  submitButton.disabled = false;
  submitButton.classList.remove(validationConfig.inactiveButtonClass);

  Modal.openModal(editPopup);
}

// Действие при изменении аватара
function openChangeAvatarForm() {
  resetForm(changeAvatarForm);
  Modal.openModal(document.querySelector(".popup.popup_type_change-avatar"));
}

// Открытие формы добавления карточки
function openAddCardForm() {
  resetForm(addNewPlaceForm);
  Modal.openModal(addNewCardPopup);
}

// Обновление профиля пользователя
function updateUserProfile(name, about) {
  return Api.updateUserInfo({ name, about });
}

// Обновление аватара пользователя
function updateUserAvatar(link) {
  return Api.updateUserAvatar(link);
}

// Создание новой карточки
function createNewCard(name, link) {
  return Api.createCard({ name, link });
}

// Обработка отправки формы редактирования профиля
function handleEditProfileSubmit(event) {
  event.preventDefault();
  const { name, description } = editProfileForm.elements;
  const submitButton = editProfileForm.querySelector(".popup__button");

  updateButtonState(submitButton, true);

  setTimeout(() => {
    updateUserProfile(name.value.trim(), description.value.trim())
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

// Обработка отправки формы изменения аватара
function handleChangeAvatarSubmit(event) {
  event.preventDefault();
  const { link: avatarLink } = changeAvatarForm.elements;
  const submitButton = changeAvatarForm.querySelector(".popup__button");

  updateButtonState(submitButton, true);

  setTimeout(() => {
    updateUserAvatar(avatarLink.value.trim())
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

// Обработка отправки формы добавления карточки
function handleAddCardSubmit(event) {
  event.preventDefault();
  const { "place-name": placeNameInput, link: linkInput } =
    addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector(".popup__button");

  updateButtonState(submitButton, true);

  setTimeout(() => {
    createNewCard(placeNameInput.value.trim(), linkInput.value.trim())
      .then((newCard) => {
        const newCardElement = createAndSetupCard(
          newCard,
          showFullscreenImage,
          newCard.owner._id
        );
        cardsStorage[newCard._id] = newCardElement;
        placesList.prepend(newCardElement);
        Modal.closeModal(addNewCardPopup);
      })
      .finally(() => {
        updateButtonState(submitButton, false);
      })
      .catch(console.error);
  }, 800);
}

// Основной обработчик удаления карточки
function handleDeleteButtonClick(cardId) {
  currentDeletingCardId = cardId;
  Modal.openModal(deleteConfirmPopup);
}

// Подтверждение удаления карточки
deleteConfirmPopup
  .querySelector(".popup__button_confirm")
  .addEventListener("click", (event) => {
    event.preventDefault();
    if (currentDeletingCardId !== null) {
      performCardDeletion(currentDeletingCardId);
      currentDeletingCardId = null;
    }
  });

// Главная точка входа приложения
Promise.all([Api.getUserInfo(), Api.getInitialCards()])
  .then(([userInfo, cards]) => {
    setUserProfile(userInfo);
    renderCards(cards, showFullscreenImage, userInfo._id);
  })
  .catch(console.error);

// Назначение обработчиков событий

// Редактирование профиля
editProfileButton.addEventListener("pointerdown", openEditProfileForm);

// Добавление карточки
addPlaceButton.addEventListener("pointerdown", openAddCardForm);

// Изменение аватара
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

// Включаем систему проверки форм
Validation.enableValidation(validationConfig);
