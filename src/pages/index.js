// index.js

// Импортируем модули и необходимые компоненты
import './index.css';                         // Подключаем файл стилей
import * as Api from '../components/api';     // Модуль API-запросов
import * as Card from '../components/card';   // Работа с карточками
import * as Modal from '../components/modal'; // Работа с модальными окнами
import * as Validation from '../components/validation'; // Валидаторы форм

// Кэширование важных элементов страницы
const placesList = document.querySelector('.places__list');                // Список мест
const editPopup = document.querySelector('.popup.popup_type_edit');        // Поп-ап редактирования профиля
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card'); // Поп-ап добавления карточки
const viewImagePopup = document.querySelector('.popup.popup_type_image');  // Поп-ап просмотра фото
const viewImage = viewImagePopup.querySelector('.popup__image');           // Изображение внутри попапа
const caption = viewImagePopup.querySelector('.popup__caption');           // Подпись к изображению
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm'); // Окно подтверждения удаления

// Кэширование форм
const editProfileForm = document.forms['edit-profile'];                   // Форма редактирования профиля
const addNewPlaceForm = document.forms['new-place'];                      // Форма добавления места
const changeAvatarForm = document.forms['change-avatar-form'];           // Форма изменения аватара

// Элементы профиля
const titleProfile = document.querySelector('.profile__title');            // Название профиля
const descriptionProfile = document.querySelector('.profile__description'); // Описание профиля

// Кнопки
const editProfileBtn = document.querySelector('.profile__edit-button');    // Редактировать профиль
const addPlaceBtn = document.querySelector('.profile__add-button');        // Добавить новое место
const profileImage = document.querySelector('.profile__image');            // Аватар профиля

// Вспомогательные функции

// Загрузка профайл-данных в форму редактирования
function loadUserDataToForm(name, description) {
  editProfileForm.name.value = name;
  editProfileForm.description.value = description;
}

// Просмотр полноразмерного изображения с очисткой src перед установкой нового изображения
function showFullscreenImage(imageSrc, imageAlt) {
  // Очищаем src перед заданием нового изображения
  viewImage.src = ''; // Очистка src предотвращает краткосрочное отображение старого изображения

  // Присваиваем новое изображение
  viewImage.src = imageSrc;
  viewImage.alt = imageAlt;
  caption.textContent = imageAlt;

  // Открываем модальное окно
  Modal.openModalWindow(viewImagePopup);
}

// Рендер стартовых карточек
function renderInitialCards(userInfo, cards, onClick, currentUserId) {
  if (userInfo) {
    titleProfile.textContent = userInfo.name;
    descriptionProfile.textContent = userInfo.about;
  }

  // Проходим по всем карточкам и создаем их элементы
  cards.forEach((data) => {
    const cardElement = Card.createCard(data, onClick, currentUserId);
    placesList.append(cardElement); // Добавляем карточку в список
  });
}

// Обновление аватара пользователя
function updateUserAvatar(avatarUrl) {
  return Api.updateUserAvatar(avatarUrl)
    .then(updatedUserInfo => {
      if (profileImage) {
        profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
        // Сохраняем новый аватар в localStorage
        localStorage.setItem('avatar', updatedUserInfo.avatar);
      }
    });
}

// Открытие окна редактирования профиля
function openEditProfile() {
  loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
  Modal.openModalWindow(editPopup);
}

// Открытие окна добавления карточки
function openAddCard() {
  Modal.openModalWindow(addNewCardPopup);
}

// Обновление профиля пользователя
function handleEditProfile(evt) {
  evt.preventDefault();

  const formElements = editProfileForm.elements;
  const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');

  // Блокируем кнопку и меняем текст
  Modal.manageButtonState(submitButton, true);

  setTimeout(() => { // Задержка
    const updatedTitle = formElements.name.value.trim();
    const updatedDescription = formElements.description.value.trim();

    Api.updateUserInfo({ name: updatedTitle, about: updatedDescription })
      .then(updatedUserInfo => {
        titleProfile.textContent = updatedUserInfo.name;
        descriptionProfile.textContent = updatedUserInfo.about;

        // Сохраняем данные в localStorage
        localStorage.setItem('name', updatedUserInfo.name);
        localStorage.setItem('about', updatedUserInfo.about);

        // Возвращаем кнопку в обычное состояние
        Modal.manageButtonState(submitButton, false);

        editProfileForm.reset();
        Modal.closePopup(editPopup);
      })
      .catch(() => {
        Modal.manageButtonState(submitButton, false);
      });
  }, 800); // Задержка в 0.8 секунды
}

// Создание новой карточки
function handleAddNewPlace(evt) {
  evt.preventDefault();

  const formElements = addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');

  // Блокируем кнопку и меняем текст
  Modal.manageButtonState(submitButton, true);

  setTimeout(() => { // Задержка
    const placeName = formElements['place-name'].value.trim();
    const linkURL = formElements.link.value.trim();

    if (!placeName || !linkURL) return;

    Api.createCard({ name: placeName, link: linkURL })
      .then(newCard => {
        const newCardElement = Card.createCard(newCard, showFullscreenImage, currentUserId);
        placesList.prepend(newCardElement); // Добавляем карточку вверх списка

        // Возвращаем кнопку в обычное состояние
        Modal.manageButtonState(submitButton, false);

        Modal.closePopup(addNewCardPopup);
        addNewPlaceForm.reset();
      })
      .catch(() => {
        Modal.manageButtonState(submitButton, false);
      });
  }, 800); // Задержка в 0.8 секунды
}

// Обновление аватара пользователя
function handleChangeAvatar(evt) {
  evt.preventDefault();

  const form = evt.currentTarget;
  const submitButton = form.querySelector('.popup__button[type="submit"]');

  // Блокируем кнопку и меняем текст
  Modal.manageButtonState(submitButton, true);

  setTimeout(() => { // Задержка 
    const avatarUrl = form.link.value.trim();

    if (!avatarUrl) {
      alert('Укажите ссылку на изображение.');
      Modal.manageButtonState(submitButton, false);
      return;
    }

    updateUserAvatar(avatarUrl)
      .then(() => {
        Modal.manageButtonState(submitButton, false);
        Modal.closePopup(document.querySelector('.popup.popup_type_change-avatar'));
        form.reset();
      })
      .catch(() => {
        Modal.manageButtonState(submitButton, false);
      });
  }, 800); // Задержка в 0.8 секунды
}

// Основная логика приложения
Promise.all([Api.getUserInfo(), Api.getInitialCards()])
  .then(([userInfo, cards]) => {
    // Получаем currentUserId и сохраняем его в глобальном пространстве
    window.currentUserId = userInfo._id;

    // Проверяем, было ли это первое посещение
    const firstVisitKey = 'firstVisit';
    const isFirstVisit = localStorage.getItem(firstVisitKey) === null;

    // Устанавливаем ключ firstVisit, чтобы больше не воспринимать следующие посещения как первые
    if (isFirstVisit) {
      localStorage.setItem(firstVisitKey, 'false');
    }

    // Определяем, какую информацию выводить при первом посещении
    const initialName = isFirstVisit ? 'Жак-Ив Кусто' : localStorage.getItem('name') || '';
    const initialAbout = isFirstVisit ? 'Исследователь океана' : localStorage.getItem('about') || '';
    const initialAvatar = isFirstVisit ? '/src/images/avatar.jpg' : localStorage.getItem('avatar') || '';

    // Отображаем соответствующую информацию
    titleProfile.textContent = initialName;
    descriptionProfile.textContent = initialAbout;
    profileImage.style.backgroundImage = `url(${initialAvatar})`;

    // Рендерим стартовые карточки
    renderInitialCards(userInfo, cards, showFullscreenImage, window.currentUserId);
  })
  .catch(() => {});

// Регистрация слушателей событий
document.addEventListener('DOMContentLoaded', () => {
  editProfileBtn.addEventListener('pointerdown', openEditProfile);
  addPlaceBtn.addEventListener('pointerdown', openAddCard);

  editProfileForm.addEventListener('submit', handleEditProfile);
  addNewPlaceForm.addEventListener('submit', handleAddNewPlace);

  Validation.enableValidation();

  // Регистрируем событие удаления карточки
  document.addEventListener('click', handleRemoveCard);

  profileImage.addEventListener('pointerdown', () => {
    Modal.openModalWindow(document.querySelector('.popup.popup_type_change-avatar'));
  });

  changeAvatarForm.addEventListener('submit', handleChangeAvatar);
});

// Обработчик удаления карточки
function handleRemoveCard(evt) {
  const target = evt.target;
  const parentCard = target.closest('.card');

  if (parentCard && target.classList.contains('card__delete-button')) {
    const cardId = parentCard.dataset.id;
    Modal.openModalWindow(deleteConfirmPopup, {
      handleAction: () => handleDeleteConfirmation(cardId, parentCard),
      confirmButtonSelector: '.popup__button_confirm'
    });
  }
}

// Обработчик удаления карточки
function handleDeleteConfirmation(cardId, cardElement) {
  Api.deleteCard(cardId)
    .then(() => {
      cardElement.remove(); // Удаляем элемент из DOM
      Modal.closePopup(deleteConfirmPopup); // Закрываем модал
    })
    .catch(() => {});
}