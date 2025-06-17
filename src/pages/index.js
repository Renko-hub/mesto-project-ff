// index.js

// Импортируем модули и необходимые компоненты
import './index.css';
import * as Api from '../components/api';
import * as Card from '../components/card';
import * as Modal from '../components/modal';
import * as Validation from '../components/validation';

// Конфигурация валидации
const defaultConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// Селекторы основных элементов
const placesList = document.querySelector('.places__list');
const editPopup = document.querySelector('.popup.popup_type_edit');
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card');
const viewImagePopup = document.querySelector('.popup.popup_type_image');
const viewImage = viewImagePopup.querySelector('.popup__image');
const caption = viewImagePopup.querySelector('.popup__caption');
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm');

// Формы
const editProfileForm = document.forms['edit-profile'];
const addNewPlaceForm = document.forms['new-place'];
const changeAvatarForm = document.forms['change-avatar-form'];

// Элементы профиля
const titleProfile = document.querySelector('.profile__title');
const descriptionProfile = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

// Кнопки
const editProfileButton = document.querySelector('.profile__edit-button');
const addPlaceButton = document.querySelector('.profile__add-button');

// Временное хранение ссылки на аватар
let tempAvatarUrl = localStorage.getItem('tempAvatarUrl');
if (tempAvatarUrl) {
  profileImage.style.backgroundImage = `url(${tempAvatarUrl})`;
}

// Управление кнопкой
function toggleButtonState(button, isDisabled, loadingText = 'Сохранение...', defaultText = 'Сохранить') {
  button.classList.toggle('popup__button_disabled', isDisabled);
  button.disabled = isDisabled;
  
  if (isDisabled) {
    button.textContent = loadingText;
  } else {
    button.textContent = defaultText;
  }
}

// Логика отображения и обработки данных

// Загрузка данных пользователя в форму редактирования
function loadUserDataToForm(name, description) {
  editProfileForm.name.value = name;
  editProfileForm.description.value = description;
  Validation.clearValidation(editProfileForm, defaultConfig);
}

// Отображение полноэкранного изображения
function showFullscreenImage(imageSrc, imageAlt) {
  viewImage.src = imageSrc;
  viewImage.alt = imageAlt;
  caption.textContent = imageAlt;
  Modal.openModal(viewImagePopup);
}

// Рендринг начальных карточек
function renderInitialCards(userInfo, cards, onClick, currentUserId) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
  }

  cards.forEach((data) => {
    placesList.append(Card.createCard(data, showFullscreenImage, currentUserId));
  });
}

// Обновление аватара пользователя
function updateUserAvatar(avatarUrl) {
  return Api.updateUserAvatar(avatarUrl)
    .then(updatedUserInfo => {
      if (profileImage) {
        profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
        localStorage.setItem('tempAvatarUrl', updatedUserInfo.avatar);
      }
    });
}

// Удаление карточки
function removeCard(cardId, element) {
  return Api.deleteCard(cardId)
    .then(() => {
      element.remove();
    })
    .catch(err => {
      console.error("Ошибка удаления карточки:", err);
    });
}

// Логика взаимодействия с пользователями

// Открытие окна редактирования профиля
function openEditProfile() {
  loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
  Modal.openModal(editPopup);
}

// Открытие окна добавления карточки
function openAddCard() {
  Modal.openModal(addNewCardPopup);
  addNewPlaceForm.reset();
  Validation.clearValidation(addNewPlaceForm, defaultConfig);
}

// Обработчики форм

// Обновление профиля
function handleEditProfile(evt) {
  evt.preventDefault();

  const formElements = editProfileForm.elements;
  const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');

  toggleButtonState(submitButton, true);

  const updatedTitle = formElements.name.value.trim();
  const updatedDescription = formElements.description.value.trim();

  setTimeout(() => {
    Api.updateUserInfo({ name: updatedTitle, about: updatedDescription })
      .then(updatedUserInfo => {
        titleProfile.textContent = updatedUserInfo.name;
        descriptionProfile.textContent = updatedUserInfo.about;
        editProfileForm.reset();
        Modal.closeModal(editPopup);
        toggleButtonState(submitButton, false);
      })
      .catch(err => {
        console.error(err);
        toggleButtonState(submitButton, false);
      });
  }, 800);
}

// Добавление новой карточки
function handleAddNewPlace(evt) {
  evt.preventDefault();

  const formElements = addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');

  toggleButtonState(submitButton, true);

  const placeName = formElements['place-name'].value.trim();
  const linkURL = formElements.link.value.trim();

  if (!placeName || !linkURL) return;

  setTimeout(() => {
    Api.createCard({ name: placeName, link: linkURL })
      .then(newCard => {
        const newCardElement = Card.createCard(newCard, showFullscreenImage, window.currentUserId);
        placesList.prepend(newCardElement);
        addNewPlaceForm.reset();
        Modal.closeModal(addNewCardPopup);
        toggleButtonState(submitButton, false);
      })
      .catch(err => {
        console.error(err);
        toggleButtonState(submitButton, false);
      });
  }, 800);
}

// Изменение аватара
function handleChangeAvatar(evt) {
  evt.preventDefault();

  const form = evt.currentTarget;
  const submitButton = form.querySelector('.popup__button[type="submit"]');

  toggleButtonState(submitButton, true);

  const avatarUrl = form.link.value.trim();

  if (!avatarUrl) return;

  setTimeout(() => {
    updateUserAvatar(avatarUrl)
      .then(() => {
        profileImage.style.backgroundImage = `url(${avatarUrl})`;
        form.reset();
        Modal.closeModal(document.querySelector('.popup.popup_type_change-avatar'));
        toggleButtonState(submitButton, false);
      })
      .catch(err => {
        console.error(err);
        toggleButtonState(submitButton, false);
      });
  }, 800);
}

// Основная логика приложения

// Инициализация и рендеринг начальных данных
Promise.all([Api.getUserInfo(), Api.getInitialCards()])
  .then(([userInfo, cards]) => {
    window.currentUserId = userInfo._id;
    renderInitialCards(userInfo, cards, showFullscreenImage, window.currentUserId);
  })
  .catch(console.error);

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
  editProfileButton.addEventListener('pointerdown', openEditProfile);
  addPlaceButton.addEventListener('pointerdown', openAddCard);

  editProfileForm.addEventListener('submit', handleEditProfile);
  addNewPlaceForm.addEventListener('submit', handleAddNewPlace);

  Validation.enableValidation(defaultConfig);

  document.addEventListener('click', evt => {
    if (evt.target.classList.contains('card__delete-button')) {
      const cardElement = evt.target.closest('[data-id]');
      if (cardElement) {
        const cardId = cardElement.dataset.id;
        deleteConfirmPopup.dataset.cardId = cardId;
        Modal.openModal(deleteConfirmPopup);
      }
    }
  });

  deleteConfirmPopup.querySelector('.popup__button').addEventListener('click', function(evt) {
    evt.preventDefault();

    const parentCard = this.closest('.popup').dataset.cardId;

    if (parentCard) {
      const cardElement = document.querySelector(`[data-id="${parentCard}"]`);
      removeCard(parentCard, cardElement);
      Modal.closeModal(deleteConfirmPopup);
    }
  });

  profileImage.addEventListener('pointerdown', () => {
    Modal.openModal(document.querySelector('.popup.popup_type_change-avatar'));
  });

  changeAvatarForm.addEventListener('submit', handleChangeAvatar);
});