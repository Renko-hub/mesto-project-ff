// index.js

// Импортируем нужные модули
import './index.css';                  // стили
import * as Api from '../components/api';   // работа с API
import * as Card from '../components/card'; // карточки
import * as Modal from '../components/modal'; // модальные окна
import * as Validation from '../components/validation'; // валидация форм

// Настройки валидации
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// Элементы интерфейса
const placesList = document.querySelector('.places__list');
const editPopup = document.querySelector('.popup.popup_type_edit');
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card');
const viewImagePopup = document.querySelector('.popup.popup_type_image');
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm');

// Формы
const editProfileForm = document.forms['edit-profile'];
const addNewPlaceForm = document.forms['new-place'];
const changeAvatarForm = document.forms['change-avatar-form'];

// Пользовательские данные
const titleProfile = document.querySelector('.profile__title');
const descriptionProfile = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

// Кнопки
const editProfileButton = document.querySelector('.profile__edit-button');
const addPlaceButton = document.querySelector('.profile__add-button');

// Показ полноэкранного изображения
function showFullscreenImage(src, alt) {
  const viewImage = viewImagePopup.querySelector('.popup__image');
  const caption = viewImagePopup.querySelector('.popup__caption');

  viewImage.src = src;
  viewImage.alt = alt;
  caption.textContent = alt;
  Modal.openModal(viewImagePopup);
}

// Переключение состояния кнопки
function toggleButtonState(button, disabled, text = 'Сохранение...') {
  button.disabled = disabled;
  button.classList.toggle('popup__button_disabled', disabled);
  button.textContent = disabled ? text : 'Сохранить';
}

// Рендирование стартовых данных
function renderInitialCards(userInfo, cards, onClickHandler, currentUserId) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
    profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
  }

  cards.forEach(cardData => {
    placesList.append(Card.createCard(cardData, onClickHandler, currentUserId));
  });
}

// Основной метод инициализации приложения
function initApp() {
  // Локальная переменная внутри initApp, доступная только здесь
  let currentUserId;

  // Загрузка начальных данных
  Promise.all([Api.getUserInfo(), Api.getInitialCards()])
    .then(([userInfo, cards]) => {
      currentUserId = userInfo._id; // сохраняем id пользователя локально
      renderInitialCards(userInfo, cards, showFullscreenImage, currentUserId);
    })
    .catch(err => console.error('Ошибка загрузки начальных данных:', err.message));

  // Редактирование профиля
  function manageProfile(evt) {
    if (evt.type === 'pointerdown') {
      Validation.clearValidation(editProfileForm, validationConfig);
      editProfileForm.name.value = titleProfile.textContent;
      editProfileForm.description.value = descriptionProfile.textContent;
      const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');
      submitButton.disabled = false;
      submitButton.classList.remove('popup__button_disabled');
      Modal.openModal(editPopup);
    } else if (evt.type === 'submit') {
      evt.preventDefault();
      const { name, description } = editProfileForm.elements;
      const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');

      if (!name.value.trim() || !description.value.trim()) {
        alert("Заполните оба поля!");
        return;
      }

      toggleButtonState(submitButton, true);
      setTimeout(() => {
        Api.updateUserInfo({ name: name.value.trim(), about: description.value.trim() })
          .then(updatedUserInfo => {
            titleProfile.textContent = updatedUserInfo.name;
            descriptionProfile.textContent = updatedUserInfo.about;
            Modal.closeModal(editPopup);
            toggleButtonState(submitButton, false);
          })
          .catch(err => {
            console.error('Ошибка при сохранении профиля:', err.message);
            toggleButtonState(submitButton, false);
          });
      }, 800);
    }
  }

  // Создание новой карточки
  function manageCard(evt) {
    if (evt.type === 'pointerdown') {
      Validation.clearValidation(addNewPlaceForm, validationConfig);
      Modal.openModal(addNewCardPopup);
    } else if (evt.type === 'submit') {
      evt.preventDefault();
      const { 'place-name': placeNameInput, link: linkInput } = addNewPlaceForm.elements;
      const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');

      if (!placeNameInput.value.trim() || !linkInput.value.trim()) {
        return;
      }

      toggleButtonState(submitButton, true);
      setTimeout(() => {
        Api.createCard({
          name: placeNameInput.value.trim(),
          link: linkInput.value.trim()
        }).then(newCard => {
          const newCardElement = Card.createCard(newCard, showFullscreenImage, currentUserId);
          placesList.prepend(newCardElement);
          Modal.closeModal(addNewCardPopup);
          addNewPlaceForm.reset();
          toggleButtonState(submitButton, false);
        }).catch(err => {
          console.error('Ошибка при создании карточки:', err.message);
          toggleButtonState(submitButton, false);
        });
      }, 800);
    }
  }

  // Изменение аватара
  function manageAvatar(evt) {
    if (evt.type === 'pointerdown') {
      Validation.clearValidation(changeAvatarForm, validationConfig);
      Modal.openModal(document.querySelector('.popup.popup_type_change-avatar'));
    } else if (evt.type === 'submit') {
      evt.preventDefault();
      const { link: avatarLink } = changeAvatarForm.elements;
      const submitButton = changeAvatarForm.querySelector('.popup__button[type="submit"]');

      if (!avatarLink.value.trim()) {
        return;
      }

      toggleButtonState(submitButton, true);
      setTimeout(() => {
        Api.updateUserAvatar(avatarLink.value.trim())
          .then(updatedUserInfo => {
            profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
            Modal.closeModal(document.querySelector('.popup.popup_type_change-avatar'));
            changeAvatarForm.reset();
            toggleButtonState(submitButton, false);
          })
          .catch(err => {
            console.error('Ошибка при обновлении аватара:', err.message);
            toggleButtonState(submitButton, false);
          });
      }, 800);
    }
  }

  // Удаление карточки
  document.addEventListener('pointerdown', evt => {
    if (evt.target.classList.contains('card__delete-button')) {
      const cardElement = evt.target.closest('[data-id]');
      if (cardElement) {
        deleteConfirmPopup.dataset.cardId = cardElement.dataset.id;
        Modal.openModal(deleteConfirmPopup);
      }
    } else if (evt.target.classList.contains('popup__button_confirm')) {
      evt.preventDefault();
      const cardId = deleteConfirmPopup.dataset.cardId;
      if (cardId) {
        const cardElement = document.querySelector(`[data-id="${cardId}"]`);
        Api.deleteCard(cardId)
          .then(() => {
            cardElement.remove();
            Modal.closeModal(deleteConfirmPopup);
          })
          .catch(err => console.error('Ошибка при удалении карточки:', err.message));
      }
    }
  });

  // Закрытие модальных окон
  function closeModalOnClick(event, popup) {
    if (event.target === popup || event.target.classList.contains('popup__close')) {
      Modal.closeModal(popup);
      if (popup === addNewCardPopup) {
        addNewPlaceForm.reset();
      } else if (popup === document.querySelector('.popup.popup_type_change-avatar')) {
        changeAvatarForm.reset();
      }
    }
  }

  // Присоединяем обработчики события pointerdown к каждому модальному окну
  document.querySelectorAll('.popup').forEach(popup => {
    popup.addEventListener('pointerdown', event => closeModalOnClick(event, popup));
  });

  // Присвоение обработчиков событий
  editProfileButton.addEventListener('pointerdown', manageProfile);
  addPlaceButton.addEventListener('pointerdown', manageCard);
  profileImage.addEventListener('pointerdown', manageAvatar);

  editProfileForm.addEventListener('submit', manageProfile);
  addNewPlaceForm.addEventListener('submit', manageCard);
  changeAvatarForm.addEventListener('submit', manageAvatar);

  // Включаем проверку валидности форм
  Validation.enableValidation(validationConfig);
}

// Инициализация приложения
initApp();