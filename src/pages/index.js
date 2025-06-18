// Импортируем модули и необходимые компоненты
import './index.css';
import * as Api from '../components/api'; // API-функции: getUserInfo, getInitialCards, createCard, updateUserInfo, deleteCard, likeCard, unLikeCard
import * as Card from '../components/card'; // createCard, toggleLike
import * as Modal from '../components/modal'; // openModal, closeModal
import * as Validation from '../components/validation'; // Пакетный импорт валидации

// Основные селекторы
const placesList = document.querySelector('.places__list');
const editPopup = document.querySelector('.popup.popup_type_edit');
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card');
const viewImagePopup = document.querySelector('.popup.popup_type_image');
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm');
const changeAvatarPopup = document.querySelector('.popup.popup_type_change-avatar'); // Селектор для окна смены аватара

// Формы
const editProfileForm = document.forms['edit-profile'];
const addNewPlaceForm = document.forms['new-place'];
const changeAvatarForm = document.forms['change-avatar-form']; // Новая форма для изменения аватара

// Элементы профиля
const titleProfile = document.querySelector('.profile__title');
const descriptionProfile = document.querySelector('.profile__description');

// Кнопки
const editProfileButton = document.querySelector('.profile__edit-button');
const addPlaceButton = document.querySelector('.profile__add-button');
const changeAvatarButton = document.querySelector('.profile__image'); // Кнопка для изменения аватара

// Рендеринг начальных карточек
function renderInitialCards(userInfo, cards, onClick, currentUserId) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
  }

  cards.forEach((data) => {
    placesList.append(Card.createCard(data, onClick, currentUserId));
  });
}

// Удаление карточки
function removeCard(cardId, element) {
  return new Promise(function(resolve, reject) {
    Api.deleteCard(cardId).then(() => resolve(element.remove())).catch(reject);
  }).catch(err => console.error("Ошибка удаления карточки:", err));
}

// Открытие окна редактирования профиля
function openEditProfile() {
  return new Promise(function(resolve, reject) {
    // Получаем текущие данные пользователя
    Api.getUserInfo().then(function(userInfo) {
      // Открываем модальное окно
      Modal.openModal(editPopup);
      
      // Заполняем форму текущими данными пользователя
      const nameInput = editProfileForm.querySelector('input[name=name]');
      const descriptionInput = editProfileForm.querySelector('input[name=description]');
  
      if (nameInput && descriptionInput) {
        nameInput.value = userInfo.name;
        descriptionInput.value = userInfo.about;
      }
  
      // Проверяем состояние кнопки
      Validation.checkButtonState(editProfileForm, defaultConfig);
      resolve();
    }).catch(reject);
  }).catch(err => console.error('Ошибка при получении данных пользователя:', err));
}

// Открытие окна добавления карточки
function openAddCard() {
  Modal.openModal(addNewCardPopup);
  addNewPlaceForm.reset(); // Очищаем поля формы при открытии
  Validation.clearValidation(addNewPlaceForm, defaultConfig); // Очистка ошибок и деактивация кнопки
  Validation.checkButtonState(addNewPlaceForm, defaultConfig);
}

// Открытие окна изменения аватара
function openChangeAvatar() {
  Modal.openModal(changeAvatarPopup);

  // Очищаем поле ввода
  changeAvatarForm.reset();

  // Очищаем любые существующие ошибки и проверяем состояние кнопки
  Validation.clearValidation(changeAvatarForm, defaultConfig);
  Validation.checkButtonState(changeAvatarForm, defaultConfig);
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
document.addEventListener('DOMContentLoaded', function() {
  if (editProfileButton && addPlaceButton) {
    editProfileButton.addEventListener('pointerdown', openEditProfile);
    addPlaceButton.addEventListener('pointerdown', openAddCard);
  } else {
    console.error('Один или несколько ключевых элементов не найдены!');
  }

  editProfileForm.addEventListener('submit', handleEditProfile);
  addNewPlaceForm.addEventListener('submit', handleAddNewPlace);
  changeAvatarForm.addEventListener('submit', handleUpdateAvatar); // Обработчик изменения аватара

  Validation.enableValidation(defaultConfig);

  // Обработчик для открытия окна изменения аватара
  if (changeAvatarButton) {
    changeAvatarButton.addEventListener('click', function() {
      openChangeAvatar(); // Используем функцию открытия окна
    });
  }

  document.addEventListener('click', function(evt) {
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
      removeCard(parentCard, cardElement).then(() => Modal.closeModal(deleteConfirmPopup)).catch(console.error);
    }
  });
});

// Обработчики форм

// Обновление профиля
function handleEditProfile(evt) {
  evt.preventDefault();

  const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');
  toggleButtonState(submitButton, true, 'Сохранение...', 'Сохранить');

  const updatedTitle = editProfileForm.name.value.trim();
  const updatedDescription = editProfileForm.description.value.trim();

  setTimeout(function() {
    Api.updateUserInfo({ name: updatedTitle, about: updatedDescription })
      .then(updatedUserInfo => {
        titleProfile.textContent = updatedUserInfo.name;
        descriptionProfile.textContent = updatedUserInfo.about;
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

  const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');
  toggleButtonState(submitButton, true, 'Сохранение...', 'Сохранить');

  const placeName = addNewPlaceForm['place-name'].value.trim();
  const linkURL = addNewPlaceForm.link.value.trim();

  if (!placeName || !linkURL) return;

  setTimeout(function() {
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

// Обновление аватара
function handleUpdateAvatar(evt) {
  evt.preventDefault();

  const submitButton = changeAvatarForm.querySelector('.popup__button[type="submit"]');
  toggleButtonState(submitButton, true, 'Сохранение...', 'Сохранить');

  const avatarLink = changeAvatarForm.link.value.trim();

  if (!avatarLink) return;

  setTimeout(function() {
    Api.updateUserAvatar(avatarLink)
      .then(response => { // Получаем обновленные данные пользователя
        const profileImage = document.querySelector('.profile__image');
        
        // Устанавливаем фоновый рисунок аватара
        profileImage.style.backgroundImage = `url(${response.avatar})`;

        // Закрываем модальное окно и отменяем индикацию загрузки
        Modal.closeModal(changeAvatarPopup);
        toggleButtonState(submitButton, false);
      })
      .catch(err => {
        console.error('Ошибка при обновлении аватара:', err);
        toggleButtonState(submitButton, false);
      });
  }, 800);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const userData = await Api.getUserInfo();
    const profileImage = document.querySelector('.profile__image');
    profileImage.style.backgroundImage = `url(${userData.avatar})`;
  } catch (err) {
    console.error('Ошибка при получении данных пользователя:', err);
  }
});

// Показ полного экрана изображения
function showFullscreenImage(imageSrc, imageAlt) {
  const viewImage = viewImagePopup.querySelector('.popup__image');
  const caption = viewImagePopup.querySelector('.popup__caption');

  viewImage.src = imageSrc;
  viewImage.alt = imageAlt;
  caption.textContent = imageAlt;
  Modal.openModal(viewImagePopup);
}

// Управление состоянием кнопки
function toggleButtonState(button, isDisabled, loadingText = 'Сохранение...', defaultText = 'Сохранить') {
  button.classList.toggle('popup__button_disabled', isDisabled);
  button.disabled = isDisabled;

  if (isDisabled) {
    button.textContent = loadingText;
  } else {
    button.textContent = defaultText;
  }
}

// Конфигурация валидации
const defaultConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};