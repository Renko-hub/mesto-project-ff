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
  const profileEditButton = document.querySelector('.profile__edit-button');
  const placeAddButton = document.querySelector('.profile__add-button');
  const editForm = document.forms['edit-profile'];
  const newPlaceForm = document.forms['new-place'];
  const profileName = document.querySelector('.profile__title');
  const profileDescription = document.querySelector('.profile__description');

  // Рендерим начальные карточки
  Card.renderInitialCards(initialCards, Modal.openFullImage); // передаем callback

  // Открытие окна редактирования профиля
  profileEditButton.addEventListener('click', () => {
    Card.loadUserDataToForm(profileName.textContent, profileDescription.textContent);
    Modal.openEditProfilePopup();
  });

  // Открытие окна добавления карточки
  placeAddButton.addEventListener('click', Modal.openNewPlacePopup);

  // Отправка формы редактирования профиля
  function handleEditFormSubmit(evt) {
    evt.preventDefault();
    let newProfileName = editForm.elements['name'].value.trim();
    let newProfileDescription = editForm.elements['description'].value.trim();
    
    profileName.textContent = newProfileName;
    profileDescription.textContent = newProfileDescription;
    Modal.closePopup();
  }

  // Добавление новой карточки
  function handleNewPlaceFormSubmit(evt) {
    evt.preventDefault();
    let placeName = newPlaceForm.elements['place-name'].value.trim();
    let linkUrl = newPlaceForm.elements['link'].value.trim();

    if (!placeName || !linkUrl) return;

    const newCardData = { name: placeName, link: linkUrl };
    const newCard = Card.createCard(newCardData, Modal.openFullImage); // передаем callback
    document.querySelector('.places__list').prepend(newCard);

    newPlaceForm.reset();
    Modal.closePopup();
  }

  // Назначаем обработчики форм
  editForm.addEventListener('submit', handleEditFormSubmit);
  newPlaceForm.addEventListener('submit', handleNewPlaceFormSubmit);

  // Обработчик кликов по оверлею
  document.addEventListener('click', Modal.handleOverlayClick);
});