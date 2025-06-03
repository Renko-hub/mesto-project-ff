// index.js

// Импортируем стили и массив карточек
import './index.css';
import { initialCards } from '../components/cards.js';

// Импортируем модули
import * as Card from '../components/card.js';
import * as Modal from '../components/modal.js';

// Глобальные переменные для хранения важных элементов DOM
const placesList = document.querySelector('.places__list');
const editPopup = document.querySelector('.popup.popup_type_edit');
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card');
const popupViewImage = document.querySelector('.popup.popup_type_image');
const popupImage = popupViewImage.querySelector('.popup__image');
const popupCaption = popupViewImage.querySelector('.popup__caption');

// Элементы форм
const formEditProfile = document.forms['edit-profile'];
const formAddNewPlace = document.forms['new-place'];
const titleProfile = document.querySelector('.profile__title');
const descriptionProfile = document.querySelector('.profile__description');

// Элементы создания форм
const profileEditButton = document.querySelector('.profile__edit-button');
const addPlaceButton = document.querySelector('.profile__add-button');

// Вспомогательная функция для загрузки данных пользователя в форму
function loadUserDataToForm(name, description) {
  const formElements = formEditProfile.elements;
  formElements.name.value = name;
  formElements.description.value = description;
}

// Показ изображения в полном размере
function showFullscreenImage(imageSrc, imageAlt) {
  popupImage.src = imageSrc;
  popupImage.alt = imageAlt;
  popupCaption.textContent = imageAlt;
  Modal.showModal(popupViewImage);
}

// Рендерим начальные карточки
function renderInitialCards(cards, onClick) {
  cards.forEach((data) => placesList.append(Card.createCard(data, onClick)));
}

// Открытие окна редактирования профиля
function openEditProfile() {
  loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
  Modal.showModal(editPopup);
}

// Открытие окна добавления карточки
function openAddCard() {
  Modal.showModal(addNewCardPopup);
}

// Обработка отправки формы редактирования профиля
function handleEdit(evt) {
  evt.preventDefault();
  const updatedTitle = formEditProfile.elements['name'].value.trim();
  const updatedDescription = formEditProfile.elements['description'].value.trim();

  titleProfile.textContent = updatedTitle;
  descriptionProfile.textContent = updatedDescription;

  Modal.closePopup(editPopup);
}

// Обработка отправки формы добавления карточки
function handleAddNewPlace(evt) {
  evt.preventDefault();
  const placeName = formAddNewPlace.elements['place-name'].value.trim();
  const linkURL = formAddNewPlace.elements['link'].value.trim();

  if (!placeName || !linkURL) return;

  const newCardData = { name: placeName, link: linkURL };
  const newCard = Card.createCard(newCardData, showFullscreenImage);
  placesList.prepend(newCard);

  formAddNewPlace.reset();
  Modal.closePopup(addNewCardPopup);
}

// Основное событие загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  // Рендерим начальные карточки
  renderInitialCards(initialCards, showFullscreenImage);

  // Настраиваем обработчики событий
  profileEditButton.addEventListener('click', openEditProfile);
  addPlaceButton.addEventListener('click', openAddCard);

  formEditProfile.addEventListener('submit', handleEdit);
  formAddNewPlace.addEventListener('submit', handleAddNewPlace);

  // Закрытие окна по оверлею
  const popups = document.querySelectorAll('.popup');
  popups.forEach((popup) => {
    popup.addEventListener('click', (event) => {
      if (event.type === 'click' && event.target === popup) {
        Modal.closePopup(popup);
      }
    });
  });

  // Закрытие окна по кнопкам
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