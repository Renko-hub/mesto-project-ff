// index.js

// Импортируем CSS и массив карточек
import './index.css';
import { initialCards } from '../components/cards.js';

// Импортируем карты и модалы
import * as Card from '../components/card.js';
import * as Modal from '../components/modal.js';

// Дом-элементы
const cardTemplate = document.querySelector('#card-template').content;
const placesList = document.querySelector('.places__list');

// Модальные окна
const editProfilePopup = document.querySelector('.popup.popup_type_edit');
const newPlacePopup = document.querySelector('.popup.popup_type_new-card');
const imagePopup = document.querySelector('.popup.popup_type_image');

//  Кнопки открытия модальных окон
const profileEditButton = document.querySelector('.profile__edit-button');
const placeAddButton = document.querySelector('.profile__add-button');

// Формы
const editForm = document.forms['edit-profile'];
const newPlaceForm = document.forms['new-place'];

// Элементы страницы для редактирования
const profileName = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');

// Поля формы редактирования профиля
const nameInput = editForm.elements['name'];
const descriptionInput = editForm.elements['description'];

// Поля формы добавления карточки
const placeNameInput = newPlaceForm.elements['place-name'];
const linkInput = newPlaceForm.elements['link'];

// Обработчик отправки формы редактирования профиля
function handleEditFormSubmit(evt) {
  evt.preventDefault(); // Предотвращаем перезагрузку страницы

  // Получаем обновленные данные из полей
  const newName = nameInput.value.trim();
  const newJob = descriptionInput.value.trim();

  // Обновляем данные на странице
  profileName.textContent = newName;
  profileDescription.textContent = newJob;

  // Закрываем модальное окно
  Modal.closeModal(editProfilePopup);
}

// Обработчик отправки формы добавления карточки
function handleNewPlaceFormSubmit(evt) {
  evt.preventDefault(); // Предотвращаем перезагрузку страницы

  // Получаем введённые данные
  const placeName = placeNameInput.value.trim();
  const linkUrl = linkInput.value.trim();

  // Создаем новую карточку
  const newCardData = { name: placeName, link: linkUrl };
  const newCard = Card.createCard(newCardData, Card.handleCardLike);

  // Добавляем новую карточку в начало списка
  placesList.prepend(newCard);

  // Очищаем поля формы
  placeNameInput.value = '';
  linkInput.value = '';

  // Закрываем модальное окно
  Modal.closeModal(newPlacePopup);
}

// Главное событие запуска приложения
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем обработку событий формы редактирования
  editForm.addEventListener('submit', handleEditFormSubmit);

  // Инициализируем обработку событий формы добавления карточки
  newPlaceForm.addEventListener('submit', handleNewPlaceFormSubmit);

  // Открытие модальных окон
  profileEditButton.addEventListener('click', () => Modal.openModal(editProfilePopup));
  placeAddButton.addEventListener('click', () => Modal.openModal(newPlacePopup));

  // Общий обработчик кликов для закрытия модальных окон
  document.addEventListener('click', Modal.handleModalClick);

  // Первоначальная отрисовка карточек
  Card.renderInitialCards(initialCards);
});