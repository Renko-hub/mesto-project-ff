// index.js

// Импортируем модули и необходимые компоненты
import './index.css';                   // Импорт стилей
import * as Api from '../components/api';       // Работа с API
import * as Card from '../components/card';     // Создание карточек
import * as Modal from '../components/modal';   // Модальные окна
import * as Validation from '../components/validation'; // Валидация форм

// Конфигурационная константа валидации
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// Предварительно выбираем все элементы DOM
const popups = document.querySelectorAll('.popup');
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

// Обновляет аватар пользователя
function updateUserAvatar(link) {
  return Api.updateUserAvatar(link).then(updatedUserInfo => ({
    avatar: updatedUserInfo.avatar,
    profileImage
  }));
}

// Загружает данные пользователя в форму редактирования
function loadUserDataToForm(name, description) {
  editProfileForm.name.value = name;
  editProfileForm.description.value = description;
}

// Показывает изображение полноэкранно
function showFullscreenImage(imageSrc, imageAlt) {
  viewImage.src = imageSrc;
  viewImage.alt = imageAlt;
  caption.textContent = imageAlt;
  Modal.openModal(viewImagePopup);
}

// Рендерит начальную коллекцию карточек
function renderInitialCards(userInfo, cards, currentUserId) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;

    if (userInfo.avatar) {
      profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
    }
  }

  cards.forEach(data => {
    placesList.append(Card.createCard(data, showFullscreenImage, currentUserId));
  });
}

// Удаляет карточку места с сервера и интерфейса
function removeCard(cardId, element) {
  return Api.deleteCard(cardId)
    .then(() => element.remove())
    .catch(err => console.error(err));
}

// Основная логика приложения
Promise.all([Api.getUserInfo(), Api.getInitialCards()])
  .then(([userInfo, initialCards]) => {
    window.currentUserId = userInfo._id;
    renderInitialCards(userInfo, initialCards, showFullscreenImage, window.currentUserId);

    // Настраиваем обработчики форм
    changeAvatarForm.addEventListener('submit', handleChangeAvatar);
    editProfileForm.addEventListener('submit', handleEditProfile);
    addNewPlaceForm.addEventListener('submit', handleAddNewPlace);

    // Подтверждение удаления карточки
    deleteConfirmPopup.querySelector('.popup__button').addEventListener('click', evt => {
      evt.preventDefault();

      const parentCard = deleteConfirmPopup.dataset.cardId;
      const cardElement = document.querySelector(`[data-id="${parentCard}"]`);

      if (parentCard && cardElement) {
        removeCard(parentCard, cardElement).then(() => {
          Modal.closeModal(deleteConfirmPopup);
        });
      }
    });

    // UI-обработчики
    editProfileButton.addEventListener('pointerdown', openEditProfile);
    addPlaceButton.addEventListener('pointerdown', openAddCard);
    profileImage.addEventListener('pointerdown', () =>
      Modal.openModal(document.querySelector('.popup.popup_type_change-avatar'))
    );
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

    // Внутренняя логика приложения

    // Изменяет аватар пользователя
    function handleChangeAvatar(evt) {
      evt.preventDefault();

      const { elements: { link } } = evt.currentTarget;
      const avatarUrl = link.value.trim();

      if (!avatarUrl) return;

      const submitButton = evt.currentTarget.querySelector('.popup__button[type="submit"]');
      toggleButtonState(submitButton, true); // Заблокировали кнопку

      setTimeout(() => {
        updateUserAvatar(avatarUrl).then(({ avatar, profileImage }) => {
          if (profileImage) {
            profileImage.style.backgroundImage = `url(${avatar})`;
          }

          Modal.closeModal(document.querySelector('.popup.popup_type_change-avatar'));
          toggleButtonState(submitButton, false); // Разблокировали кнопку
        }).catch(err => {
          console.error(err); // Только выводим объект ошибки
          toggleButtonState(submitButton, false); // Разблокировали кнопку
        });
      }, 800);
    }

    // Редактирует профиль пользователя
    function handleEditProfile(evt) {
      evt.preventDefault();

      const { elements: { name, description } } = evt.currentTarget;
      const submitButton = evt.currentTarget.querySelector('.popup__button[type="submit"]');

      toggleButtonState(submitButton, true); // Заблокировали кнопку

      const updatedTitle = name.value.trim();
      const updatedDescription = description.value.trim();

      setTimeout(() => {
        Api.updateUserInfo({ name: updatedTitle, about: updatedDescription }).then(updatedUserInfo => {
          titleProfile.textContent = updatedUserInfo.name;
          descriptionProfile.textContent = updatedUserInfo.about;
          Modal.closeModal(editPopup);
          toggleButtonState(submitButton, false); // Разблокировали кнопку
        }).catch(err => {
          console.error(err); // Только выводим объект ошибки
          toggleButtonState(submitButton, false); // Разблокировали кнопку
        });
      }, 800);
    }

    // Добавляет новую карточку места
    function handleAddNewPlace(evt) {
      evt.preventDefault();

      const { elements: { 'place-name': placeName, link } } = evt.currentTarget;
      const submitButton = evt.currentTarget.querySelector('.popup__button[type="submit"]');

      toggleButtonState(submitButton, true); // Заблокировали кнопку

      const placeNameValue = placeName.value.trim();
      const linkValue = link.value.trim();

      if (!placeNameValue || !linkValue) return;

      setTimeout(() => {
        Api.createCard({ name: placeNameValue, link: linkValue }).then(newCard => {
          const newCardElement = Card.createCard(newCard, showFullscreenImage, window.currentUserId);
          placesList.prepend(newCardElement);
          Modal.closeModal(addNewCardPopup);
          toggleButtonState(submitButton, false); // Разблокировали кнопку
        }).catch(err => {
          console.error(err); // Только выводим объект ошибки
          toggleButtonState(submitButton, false); // Разблокировали кнопку
        });
      }, 800);
    }

    // Открывает окно добавления новой карточки
    function openAddCard() {
      Modal.openModal(addNewCardPopup);
    }

    // Переключает состояние кнопки (активна / заблокирована)
    function toggleButtonState(button, disabled) {
      button.disabled = disabled;
      button.classList.toggle('popup__button_disabled', disabled);

      // Меняем текст кнопки
      button.textContent = disabled ? 'Сохранение...' : 'Сохранить';
    }

    // Открывает окно редактирования профиля
    function openEditProfile() {
      loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
      Validation.checkButtonState(editProfileForm, validationConfig);
      Modal.openModal(editPopup);
    }
  })
  .catch(err => {
    console.error(err); // Только выводим объект ошибки
  });

// Закрываем модальные окна по клику на оверлей или кнопку закрытия
popups.forEach((popup) => {
  // Обработчик клика на оверлей
  popup.addEventListener('pointerdown', (evt) => {
    if (evt.target === popup) { // Если клик произошел непосредственно на оверлее
      Modal.closeModal(popup);

      // Выполняем очистку валидации только для нужных форм
      if (popup.classList.contains('popup_type_change-avatar')) {
        Validation.clearValidation(changeAvatarForm, validationConfig);
        changeAvatarForm.reset(); // Сброс формы "Изменить аватар"
      }

      if (popup.classList.contains('popup_type_new-card')) {
        Validation.clearValidation(addNewPlaceForm, validationConfig);
        addNewPlaceForm.reset(); // Сброс формы "Создать новое место"
      }

      if (popup.classList.contains('popup_type_edit')) {
        Validation.clearValidation(editProfileForm, validationConfig); // Очистка ошибок валидации для формы "Редактировать профиль"
      }
    }
  });

  // Добавляем слушателя на кнопку закрытия
  const closeButton = popup.querySelector('.popup__close');
  if (closeButton) {
    closeButton.addEventListener('pointerdown', (evt) => {
      Modal.closeModal(popup);

      // Выполняем очистку валидации только для нужных форм
      if (popup.classList.contains('popup_type_change-avatar')) {
        Validation.clearValidation(changeAvatarForm, validationConfig);
        changeAvatarForm.reset(); // Сброс формы "Изменить аватар"
      }

      if (popup.classList.contains('popup_type_new-card')) {
        Validation.clearValidation(addNewPlaceForm, validationConfig);
        addNewPlaceForm.reset(); // Сброс формы "Создать новое место"
      }

      if (popup.classList.contains('popup_type_edit')) {
        Validation.clearValidation(editProfileForm, validationConfig); // Очистка ошибок валидации для формы "Редактировать профиль"
      }
    });
  }
});

// Включаем валидацию форм
Validation.enableValidation(validationConfig);