// index.js

// Импортируем стили и массив карточек
import './index.css';
import { initialCards } from '../components/cards.js';

// Импортируем карты и модалы
import * as Card from '../components/card.js';
import * as Modal from '../components/modal.js';

// Запуск сценария после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const buttonEditProfile = document.querySelector('.profile__edit-button');
  const buttonAddPlace = document.querySelector('.profile__add-button');
  const formEditProfile = document.forms['edit-profile'];
  const formAddNewPlace = document.forms['new-place'];
  const titleProfile = document.querySelector('.profile__title');
  const descriptionProfile = document.querySelector('.profile__description');

  // Рендерим начальные карточки
  Card.renderInitialCards(initialCards, Modal.showFullscreenImage);

  // Открытие окна редактирования профиля
  buttonEditProfile.addEventListener('click', () => {
    Card.loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
    Modal.showModal(document.querySelector('.popup.popup_type_edit'));
  });

  // Открытие окна добавления карточки
  buttonAddPlace.addEventListener('click', () => {
    Modal.showModal(document.querySelector('.popup.popup_type_new-card'));
  });

  // Обработчик отправки формы редактирования профиля
  function handleEditFormSubmit(evt) {
    evt.preventDefault();
    const updatedTitle = formEditProfile.elements['name'].value.trim();
    const updatedDescription = formEditProfile.elements['description'].value.trim();

    titleProfile.textContent = updatedTitle;
    descriptionProfile.textContent = updatedDescription;

    Modal.closePopup(document.querySelector('.popup.popup_type_edit'));
  }

  // Обработчик отправки формы добавления карточки
  function handleAddNewPlaceFormSubmit(evt) {
    evt.preventDefault();
    const placeName = formAddNewPlace.elements['place-name'].value.trim();
    const linkURL = formAddNewPlace.elements['link'].value.trim();

    if (!placeName || !linkURL) return;

    const newCardData = { name: placeName, link: linkURL };
    const newCard = Card.createCard(newCardData, Modal.showFullscreenImage);
    document.querySelector('.places__list').prepend(newCard);

    formAddNewPlace.reset();
    Modal.closePopup(document.querySelector('.popup.popup_type_new-card'));
  }

  // Обработчики форм
  formEditProfile.addEventListener('submit', handleEditFormSubmit);
  formAddNewPlace.addEventListener('submit', handleAddNewPlaceFormSubmit);

  // Обработка закрытия окна по оверлею
  const popups = document.querySelectorAll('.popup');
  popups.forEach((popup) => {
    popup.addEventListener('click', (event) => {
      if (event.target === popup) {
        Modal.closePopup(popup);
      }
    });
  });

  // Обработчики для кнопок закрытия
  const closeButtons = document.querySelectorAll('.popup__close');
  closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const popup = event.target.closest('.popup');
      if (popup) {
        Modal.closePopup(popup);
      }
    });
  });
});