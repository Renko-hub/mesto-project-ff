// index.js

// Импортируем модули
import './index.css';                     // Стили
import * as Api from '../components/api';     // Работа с API
import * as Card from '../components/card';   // Карточки
import * as Modal from '../components/modal'; // Модальные окна
import * as Validation from '../components/validation'; // Валидация форм

// Настройки конфигурации валидации
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// Переменная хранения идентификатора текущего пользователя
let currentUserId;

// Интерфейсные элементы
const popups = document.querySelectorAll('.popup');
const placesList = document.querySelector('.places__list');
const editPopup = document.querySelector('.popup.popup_type_edit');                // Окно редактирования профиля
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card');      // Окно добавления карточки
const viewImagePopup = document.querySelector('.popup.popup_type_image');          // Просмотр изображения
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm'); // Подтверждение удаления

// Формы
const editProfileForm = document.forms['edit-profile'];
const addNewPlaceForm = document.forms['new-place'];
const changeAvatarForm = document.forms['change-avatar-form'];

// Данные профиля
const titleProfile = document.querySelector('.profile__title');
const descriptionProfile = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

// Кнопки
const editProfileButton = document.querySelector('.profile__edit-button');
const addPlaceButton = document.querySelector('.profile__add-button');

// Функция отображения полноразмерного изображения
function showFullscreenImage(imageSrc, imageAlt) {
  const viewImage = viewImagePopup.querySelector('.popup__image');
  const caption = viewImagePopup.querySelector('.popup__caption');

  viewImage.src = imageSrc;
  viewImage.alt = imageAlt;
  caption.textContent = imageAlt;
  Modal.openModal(viewImagePopup);
}

// Функция переключения состояния кнопки
function toggleButtonState(button, isDisabled, loadingText = 'Сохранение...') {
  button.disabled = isDisabled;
  button.classList.toggle('popup__button_disabled', isDisabled);
  button.textContent = isDisabled ? loadingText : 'Сохранить';
}

// Функция открытия модального окна
function openModal(promoWindow) {
  Modal.openModal(promoWindow);
}

// Рендер начальной страницы
function renderInitialCards(userInfo, cards, onClickHandler, currentUserId) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;

    if (userInfo.avatar) {
      profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
    }
  }

  cards.forEach((data) => {
    placesList.append(Card.createCard(data, onClickHandler, currentUserId));
  });
}

// Входная точка приложения
function initApp() {
  // Загрузка начальных данных
  Promise.all([Api.getUserInfo(), Api.getInitialCards()])
    .then(function ([userInfo, cards]) {
      currentUserId = userInfo._id;
      renderInitialCards(userInfo, cards, showFullscreenImage, currentUserId);
    })
    .catch(function (err) {
      console.error('Ошибка загрузки начальных данных:', err.message);
    });

  // Обработчик редактирования профиля
  function manageProfile(evt) {
    if (evt.type === 'pointerdown') {
      // Очистка валидации перед открытием окна
      Validation.clearValidation(editProfileForm, validationConfig);

      editProfileForm.name.value = titleProfile.textContent;
      editProfileForm.description.value = descriptionProfile.textContent;

      // Блокировка кнопки, если форма невалидна
      const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');
      toggleButtonState(submitButton, !editProfileForm.checkValidity()); // Валидная форма → активная кнопка

      openModal(editPopup); // Просто открываем окно
    } else if (evt.type === 'submit') {
      evt.preventDefault();

      const formElements = editProfileForm.elements;
      const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');

      const updatedTitle = formElements.name.value.trim();
      const updatedDescription = formElements.description.value.trim();

      if (!updatedTitle || !updatedDescription) {
        alert("Заполните оба поля!");
        return;
      }

      toggleButtonState(submitButton, true);

      setTimeout(() => {
        Api.updateUserInfo({ name: updatedTitle, about: updatedDescription })
          .then((updatedUserInfo) => {
            titleProfile.textContent = updatedUserInfo.name;
            descriptionProfile.textContent = updatedUserInfo.about;
            Modal.closeModal(editPopup);
            toggleButtonState(submitButton, false); // Возвращаем активную кнопку
          })
          .catch((err) => {
            console.error('Ошибка при сохранении профиля:', err.message);
            toggleButtonState(submitButton, false); // Возвращаем активную кнопку
          });
      }, 800);
    }
  }

  // Обработчик создания новой карточки
  function manageCard(evt) {
    if (evt.type === 'pointerdown') {
      // Очистка валидации перед открытием окна
      
      Validation.clearValidation(addNewPlaceForm, validationConfig);

      // Блокировка кнопки, если форма невалидна
      const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');
      toggleButtonState(submitButton, !addNewPlaceForm.checkValidity()); // Валидная форма → активная кнопка

      openModal(addNewCardPopup); // Просто открываем окно
    } else if (evt.type === 'submit') {
      evt.preventDefault();

      const formElements = addNewPlaceForm.elements;
      const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');

      toggleButtonState(submitButton, true);

      const placeName = formElements['place-name'].value.trim();
      const linkURL = formElements.link.value.trim();

      if (!placeName || !linkURL) {
        return;
      }

      setTimeout(() => {
        Api.createCard({ name: placeName, link: linkURL })
          .then((newCard) => {
            const newCardElement = Card.createCard(newCard, showFullscreenImage, currentUserId);
            placesList.prepend(newCardElement);
            Modal.closeModal(addNewCardPopup);
            toggleButtonState(submitButton, false); // Возвращаем активную кнопку
          })
          .catch((err) => {
            console.error('Ошибка при создании карточки:', err.message);
            toggleButtonState(submitButton, false); // Возвращаем активную кнопку
          });
      }, 800);
    }
  }

  // Обработчик изменения аватара
  function manageAvatar(evt) {
    if (evt.type === 'pointerdown') {
      // Очистка валидации перед открытием окна
      Validation.clearValidation(changeAvatarForm, validationConfig);

      // Блокировка кнопки, если форма невалидна
      const submitButton = changeAvatarForm.querySelector('.popup__button[type="submit"]');
      toggleButtonState(submitButton, !changeAvatarForm.checkValidity()); // Валидная форма → активная кнопка

      openModal(document.querySelector('.popup.popup_type_change-avatar')); // Просто открываем окно
    } else if (evt.type === 'submit') {
      evt.preventDefault();

      const form = evt.currentTarget;
      const submitButton = form.querySelector('.popup__button[type="submit"]');

      toggleButtonState(submitButton, true);

      const avatarUrl = form.elements['link'].value.trim();

      if (!avatarUrl) {
        return;
      }

      setTimeout(() => {
        Api.updateUserAvatar(avatarUrl)
          .then((updatedUserInfo) => {
            profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
            Modal.closeModal(document.querySelector('.popup.popup_type_change-avatar'));
            toggleButtonState(submitButton, false); // Возвращаем активную кнопку
          })
          .catch((err) => {
            console.error('Ошибка при обновлении аватара:', err.message);
            toggleButtonState(submitButton, false); // Возвращаем активную кнопку
          });
      }, 800);
    }
  }

  // Обработчик удаления карточки
  document.addEventListener('click', function (evt) {
    if (evt.target.classList.contains('card__delete-button')) {
      const cardElement = evt.target.closest('[data-id]');
      if (cardElement) {
        const cardId = cardElement.dataset.id;
        deleteConfirmPopup.dataset.cardId = cardId;
        Modal.openModal(deleteConfirmPopup);
      }
    } else if (evt.target.classList.contains('popup__button_confirm')) {
      evt.preventDefault();

      const parentCard = deleteConfirmPopup.dataset.cardId;

      if (parentCard) {
        const cardElement = document.querySelector(`[data-id="${parentCard}"]`);
        Api.deleteCard(parentCard)
          .then(() => {
            cardElement.remove();
            Modal.closeModal(deleteConfirmPopup);
          })
          .catch((err) => {
            console.error('Ошибка при удалении карточки:', err.message);
          });
      }
    }
  });

  // Обработчик закрытия модальных окон
  const handlePointerDown = function (event, popup) {
    if (event.target === popup || event.target.classList.contains('popup__close')) {
      Modal.closeModal(popup);

      // Сброс конкретной формы при закрытии нужного окна
      if (popup === addNewCardPopup) {
        addNewPlaceForm.reset(); // Сброс формы "Новое место"
      } else if (popup === document.querySelector('.popup.popup_type_change-avatar')) {
        changeAvatarForm.reset(); // Сброс формы "Обновление аватара"
      }
    }
  };

  // Прикрепляем обработчики событий ко всем модальным окнам
  popups.forEach(function (popup) {
    popup.addEventListener('pointerdown', function (event) {
      handlePointerDown(event, popup);
    });
  });

  // Обработчики событий
  editProfileButton.addEventListener('pointerdown', manageProfile);
  addPlaceButton.addEventListener('pointerdown', manageCard);
  profileImage.addEventListener('pointerdown', manageAvatar);

  editProfileForm.addEventListener('submit', manageProfile);
  addNewPlaceForm.addEventListener('submit', manageCard);
  changeAvatarForm.addEventListener('submit', manageAvatar);

  // Включаем валидацию форм
  Validation.enableValidation(validationConfig);
}

// Запускаем приложение
initApp();