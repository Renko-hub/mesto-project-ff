// index.js

// Импортируем стили и модули
import './index.css';                                   // Подключаем файл стилей
import * as Api from '../components/api';               // Модуль API-запросов
import * as Card from '../components/card';             // Работа с карточками
import * as Modal from '../components/modal';           // Работа с модальными окнами
import * as Validation from '../components/validation'; // Валидаторы форм

// Кэшируем нужные элементы страницы
const placesList = document.querySelector('.places__list');                 // Контейнер карточек
const editPopup = document.querySelector('.popup.popup_type_edit');         // Поп-ап редактирования профиля
const addNewCardPopup = document.querySelector('.popup.popup_type_new-card'); // Поп-ап добавления карточки
const viewImagePopup = document.querySelector('.popup.popup_type_image');   // Поп-ап просмотра фото
const viewImage = viewImagePopup.querySelector('.popup__image');            // Изображение в поп-апе
const caption = viewImagePopup.querySelector('.popup__caption');            // Подпись к изображению
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm'); // Окно подтверждения удаления

// Формы
const editProfileForm = document.forms['edit-profile'];                     // Форма редактирования профиля
const addNewPlaceForm = document.forms['new-place'];                       // Форма добавления карточки
const changeAvatarForm = document.forms['change-avatar-form'];             // Форма изменения аватара

// Профильные элементы
const titleProfile = document.querySelector('.profile__title');             // Заголовок профиля
const descriptionProfile = document.querySelector('.profile__description'); // Описание профиля
const profileImage = document.querySelector('.profile__image');             // Аватар профиля

// Кнопки
const editProfileBtn = document.querySelector('.profile__edit-button');     // Кнопка редактирования профиля
const addPlaceBtn = document.querySelector('.profile__add-button');         // Кнопка добавления карточки

// Вспомогательные функции

// Загружаем данные профиля в форму редактирования
function loadUserDataToForm(name, description) {
  editProfileForm.name.value = name;
  editProfileForm.description.value = description;
}

// Показ полного изображения
function showFullscreenImage(imageSrc, imageAlt) {
  // Очищаем src перед загрузкой нового изображения
  viewImage.src = '';

  // Устанавливаем новое изображение
  viewImage.src = imageSrc;
  viewImage.alt = imageAlt;
  caption.textContent = imageAlt;

  // Открываем модальное окно
  Modal.openModalWindow(viewImagePopup);
}

// Рендер начальных карточек
function renderInitialCards(cards, onClick, currentUserId) {
  // Проходим по всем карточкам и создаём их элементы
  cards.forEach((data) => {
    const cardElement = Card.createCard(data, onClick, currentUserId);
    placesList.append(cardElement); // Добавляем карточку в список
  });
}

// Обновляем аватар пользователя
function updateUserAvatar(avatarUrl) {
  return Api.updateUserAvatar(avatarUrl)
    .then(updatedUserInfo => {
      if (profileImage) {
        profileImage.style.backgroundImage = `url(${updatedUserInfo.avatar})`;
        
        // Сохраняем только аватар отдельно
        localStorage.setItem('avatar', updatedUserInfo.avatar);
      }
    });
}

// Управление кнопкой с задержкой
function manageButtonWithDelay(button, action) {
  Modal.manageButtonState(button, true);

  setTimeout(() => {
    action().then(() => {
      Modal.manageButtonState(button, false);
    }).catch(() => {
      Modal.manageButtonState(button, false);
    });
  }, 800); // Задержка в 0.8 секунды
}

// Открывает окно редактирования профиля
function openEditProfile() {
  loadUserDataToForm(titleProfile.textContent, descriptionProfile.textContent);
  Modal.openModalWindow(editPopup);
}

// Открывает окно добавления карточки
function openAddCard() {
  Modal.openModalWindow(addNewCardPopup);
}

// Обновляет профиль пользователя локально
function handleEditProfile(evt) {
  evt.preventDefault();

  const formElements = editProfileForm.elements;
  const submitButton = editProfileForm.querySelector('.popup__button[type="submit"]');

  const updatedTitle = formElements.name.value.trim();
  const updatedDescription = formElements.description.value.trim();

  // Сразу меняем данные на странице
  titleProfile.textContent = updatedTitle;
  descriptionProfile.textContent = updatedDescription;

  // Сохраняем данные локально
  localStorage.setItem('user-data', JSON.stringify({
    name: updatedTitle,
    about: updatedDescription
  }));

  editProfileForm.reset();
  Modal.closePopup(editPopup);
}

// Создает новую карточку
function handleAddNewPlace(evt) {
  evt.preventDefault();

  const formElements = addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');

  const placeName = formElements['place-name'].value.trim();
  const linkURL = formElements.link.value.trim();

  if (!placeName || !linkURL) return;

  manageButtonWithDelay(submitButton, () =>
    Api.createCard({ name: placeName, link: linkURL })
      .then(newCard => {
        const newCardElement = Card.createCard(newCard, showFullscreenImage, window.currentUserId);
        placesList.prepend(newCardElement); // Добавляем карточку вверх списка

        Modal.closePopup(addNewCardPopup);
        addNewPlaceForm.reset();
      })
  );
}

// Обновляет аватар пользователя
function handleChangeAvatar(evt) {
  evt.preventDefault();

  const form = evt.currentTarget;
  const submitButton = form.querySelector('.popup__button[type="submit"]');

  const avatarUrl = form.link.value.trim();

  if (!avatarUrl) return;

  manageButtonWithDelay(submitButton, () =>
    updateUserAvatar(avatarUrl)
      .then(() => {
        Modal.closePopup(document.querySelector('.popup.popup_type_change-avatar'));
        form.reset();
      })
  );
}

// Главная логика приложения
Promise.all([
  Api.getInitialCards()
]).then(function ([cards]) {
  // Получаем currentUserId и сохраняем его в глобальном пространстве
  window.currentUserId = null; // Предположительно id удалён из контекста

  // Проверяем, есть ли локальные данные пользователя
  let cachedUserData = localStorage.getItem('user-data');
  if (cachedUserData) {
    let { name, about } = JSON.parse(cachedUserData);

    // Отображаем данные из localStorage
    titleProfile.textContent = name;
    descriptionProfile.textContent = about;
  } else {
    // Новому пользователю показываем дефолтные данные
    titleProfile.textContent = 'Жак-Ив Кусто';
    descriptionProfile.textContent = 'Исследователь океана';

    // Сохраняем дефолтные данные в localStorage
    localStorage.setItem('user-data', JSON.stringify({
      name: 'Жак-Ив Кусто',
      about: 'Исследователь океана'
    }));
  }

  // Применяем аватар из localStorage
  const avatarUrl = localStorage.getItem('avatar');
  if (avatarUrl) {
    profileImage.style.backgroundImage = `url("${avatarUrl}")`;
  } else {
    // Дефолтный аватар
    profileImage.style.backgroundImage = `url("/src/images/default_avatar.jpg")`;
  }

  // Рендерим начальные карточки
  renderInitialCards(cards, showFullscreenImage, window.currentUserId);
}).catch(function () {});

// Обрабатываем закрытие страницы
window.onbeforeunload = function () {};

// Регистрируем слушатели событий
document.addEventListener('DOMContentLoaded', function () {
  editProfileBtn.addEventListener('pointerdown', openEditProfile);
  addPlaceBtn.addEventListener('pointerdown', openAddCard);

  editProfileForm.addEventListener('submit', handleEditProfile);
  addNewPlaceForm.addEventListener('submit', handleAddNewPlace);

  Validation.enableValidation();

  // Регистрируем событие удаления карточки
  document.addEventListener('click', handleRemoveCard);

  profileImage.addEventListener('pointerdown', function () {
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
      handleAction: function () {
        handleDeleteConfirmation(cardId, parentCard);
      },
      confirmButtonSelector: '.popup__button_confirm'
    });
  }
}

// Обработчик удаления карточки
function handleDeleteConfirmation(cardId, cardElement) {
  Api.deleteCard(cardId).then(function () {
    cardElement.remove(); // Удаляем элемент из DOM
    Modal.closePopup(deleteConfirmPopup); // Закрываем модал
  }).catch(function () {});
}