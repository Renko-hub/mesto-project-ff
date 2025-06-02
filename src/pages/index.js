// index.js

// Импортируем стили и массив карточек
import './index.css';
import { initialCards } from '../components/cards.js';

// Импортируем карты и модалы
import * as Card from '../components/card.js';
import * as Modal from '../components/modal.js';

// Главный сценарий после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const buttonEditProfile = document.querySelector('.profile__edit-button');
  const buttonAddPlace = document.querySelector('.profile__add-button');
  const formEditProfile = document.forms['edit-profile'];
  const formAddNewPlace = document.forms['new-place'];
  const titleProfile = document.querySelector('.profile__title');
  const descriptionProfile = document.querySelector('.profile__description');

  // Рендерим начальные карточки
  Card.renderInitialCards(initialCards, Modal.openFullImage); // передаем callback

  // Открытие окна редактирования профиля
  buttonEditProfile.addEventListener('click', () => {
    Card.loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
    Modal.openEditProfilePopup();
  });

  // Открытие окна добавления карточки
  buttonAddPlace.addEventListener('click', () => {
    Modal.openAddNewPlacePopup();
  });

  // Отправка формы редактирования профиля
  function handleEditFormSubmit(evt) {
    evt.preventDefault();
    let updatedTitle = formEditProfile.elements['name'].value.trim();
    let updatedDescription = formEditProfile.elements['description'].value.trim();

    titleProfile.textContent = updatedTitle;
    descriptionProfile.textContent = updatedDescription;
    Modal.closePopup();
  }

  // Добавление новой карточки
  function handleAddNewPlaceFormSubmit(evt) {
    evt.preventDefault();
    let placeName = formAddNewPlace.elements['place-name'].value.trim();
    let linkURL = formAddNewPlace.elements['link'].value.trim();

    if (!placeName || !linkURL) return;

    const newCardData = { name: placeName, link: linkURL };
    const newCard = Card.createCard(newCardData, Modal.openFullImage); // передаем callback
    document.querySelector('.places__list').prepend(newCard);

    formAddNewPlace.reset();
    Modal.closePopup();
  }

  // Назначаем обработчики форм
  formEditProfile.addEventListener('submit', handleEditFormSubmit);
  formAddNewPlace.addEventListener('submit', handleAddNewPlaceFormSubmit);

  // Обработчик кликов по оверлею
  document.addEventListener('click', Modal.handleOverlayClick);
});