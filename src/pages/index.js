// Импортируем стили и модули
import './index.css';                          // Подключаем файл стилей
import * as Api from '../components/api';      // Модуль API-запросов
import * as Card from '../components/card';    // Работа с карточками
import * as Modal from '../components/modal';  // Работа с модальными окнами
import * as Validation from '../components/validation'; // Валидаторы форм

// Кэширование нужных элементов страницы
const placesList = document.querySelector('.places__list');                 // Контейнер карточек
const editPopup = document.querySelector('.popup.popup_type_edit');         // Поп-ап редактирования профиля
const addNewCardPopup = document.queryselector('.popup.popup_type_new-card'); // Поп-ап добавления карточки
const viewImagePopup = document.querySelector('.popup.popup_type_image');   // Поп-ап просмотра фото
const viewImage = viewImagePopup.querySelector('.popup__image');            // Изображение в поп-апе
const caption = viewImagePopup.querySelector('.popup__caption');            // Подпись к изображению
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm'); // Окно подтверждения удаления

// Формы
const editProfileForm = document.forms['edit-profile'];                     // Форма редактирования профиля
const addNewPlaceForm = document.forms['new-place'];                        // Форма добавления карточки
const changeAvatarForm = document.forms['change-avatar-form'];              // Форма изменения аватара

// Профильные элементы
const titleProfile = document.querySelector('.profile__title');              // Заголовок профиля
const descriptionProfile = document.querySelector('.profile__description');  // Описание профиля
const profileImage = document.querySelector('.profile__image');              // Аватар профиля

// Кнопки
const editProfileBtn = document.querySelector('.profile__edit-button');      // Кнопка редактирования профиля
const addPlaceBtn = document.querySelector('.profile__add-button');          // Кнопка добавления карточки

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

  // Проходим по всем карточкам и создаём их элементы
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

// Функция сохранения данных в localStorage
function saveUserData() {
  localStorage.setItem('user-data', JSON.stringify({
    name: titleProfile.textContent,
    about: descriptionProfile.textContent,
    avatar: profileImage.style.backgroundImage.match(/url$"?(.*?)"?$/) ?
            RegExp.$1.replace(/["']/g, '') :
            ''
  }));
}

// Общие обработчики для кнопок
function handleButtonWithDelay(button, action) {
  // Блокировка кнопки во время выполнения операции
  Modal.manageButtonState(button, true);

  // Выполняем действие с небольшой задержкой
  setTimeout(() => {
    action().then(() => {
      // Возвращаем кнопку в исходное состояние
      Modal.manageButtonState(button, false);
    }).catch(() => {
      // В случае ошибки возвращаем кнопку в исходное состояние
      Modal.manageButtonState(button, false);
    });
  }, 800); // Задержка в 0.8 секунды
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

  const updatedTitle = formElements.name.value.trim();
  const updatedDescription = formElements.description.value.trim();

  // Действие с задержкой
  handleButtonWithDelay(submitButton, () =>
    Api.updateUserInfo({ name: updatedTitle, about: updatedDescription })
      .then(updatedUserInfo => {
        titleProfile.textContent = updatedUserInfo.name;
        descriptionProfile.textContent = updatedUserInfo.about;

        // Сохраняем данные в localStorage
        saveUserData();

        editProfileForm.reset();
        Modal.closePopup(editPopup);
      })
  );
}

// Создание новой карточки
function handleAddNewPlace(evt) {
  evt.preventDefault();

  const formElements = addNewPlaceForm.elements;
  const submitButton = addNewPlaceForm.querySelector('.popup__button[type="submit"]');

  const placeName = formElements['place-name'].value.trim();
  const linkURL = formElements.link.value.trim();

  if (!placeName || !linkURL) return;

  // Действие с задержкой
  handleButtonWithDelay(submitButton, () =>
    Api.createCard({ name: placeName, link: linkURL })
      .then(newCard => {
        const newCardElement = Card.createCard(newCard, showFullscreenImage, window.currentUserId);
        placesList.prepend(newCardElement); // Добавляем карточку вверх списка

        Modal.closePopup(addNewCardPopup);
        addNewPlaceForm.reset();
      })
  );
}

// Обновление аватара пользователя
function handleChangeAvatar(evt) {
  evt.preventDefault();

  const form = evt.currentTarget;
  const submitButton = form.querySelector('.popup__button[type="submit"]');

  const avatarUrl = form.link.value.trim();

  if (!avatarUrl) return;

  // Действие с задержкой
  handleButtonWithDelay(submitButton, () =>
    updateUserAvatar(avatarUrl)
      .then(() => {
        Modal.closePopup(document.querySelector('.popup.popup_type_change-avatar'));
        form.reset();

        // Сохраняем данные в localStorage
        saveUserData();
      })
  );
}

// Основная логика приложения
Promise.all([
  Api.getUserInfo(),
  Api.getInitialCards()
])
.then(function([userInfo, cards]) {
  // Получаем currentUserId и сохраняем его в глобальном пространстве
  window.currentUserId = userInfo._id;

  // Определим, является ли это первый визит
  const firstVisitKey = 'firstVisit';
  let isFirstVisit = localStorage.getItem(firstVisitKey) !== 'false';

  if (isFirstVisit) {
    // Используем дефолтные значения при первом визите
    const defaultValues = { name: 'Жак-Ив Кусто', about: 'Исследователь океана', avatar: '/src/images/avatar.jpg'};
    Object.assign(localStorage, defaultValues);
    localStorage.setItem(firstVisitKey, 'false'); // Устанавливаем значение "не первый визит"
  }

  // Применяем данные пользователя
  titleProfile.textContent = userInfo.name || localStorage.getItem('name');
  descriptionProfile.textContent = userInfo.about || localStorage.getItem('about');

  // Проверяем наличие аватара и задаём его
  if (userInfo.avatar) {
    profileImage.style.backgroundImage = `url(${userInfo.avatar})`;
    localStorage.setItem('avatar', userInfo.avatar);
  } else if (localStorage.getItem('avatar')) {
    profileImage.style.backgroundImage = `url(${localStorage.getItem('avatar')})`;
  }

  // Рендерим стартовые карточки
  renderInitialCards(userInfo, cards, showFullscreenImage, window.currentUserId);
})
.catch(function() {});

// Обработка закрытия страницы
window.onbeforeunload = function() {
  // Очищаем только флаг первого визита
  localStorage.removeItem('firstVisit');

  // Другие данные остаются сохранёнными
};

// Регистрация слушателей событий
document.addEventListener('DOMContentLoaded', function() {
  editProfileBtn.addEventListener('pointerdown', openEditProfile);
  addPlaceBtn.addEventListener('pointerdown', openAddCard);

  editProfileForm.addEventListener('submit', handleEditProfile);
  addNewPlaceForm.addEventListener('submit', handleAddNewPlace);

  Validation.enableValidation();

  // Регистрируем событие удаления карточки
  document.addEventListener('click', handleRemoveCard);

  profileImage.addEventListener('pointerdown', function() {
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
      handleAction: function() {
        handleDeleteConfirmation(cardId, parentCard);
      },
      confirmButtonSelector: '.popup__button_confirm'
    });
  }
}

// Обработчик удаления карточки
function handleDeleteConfirmation(cardId, cardElement) {
  Api.deleteCard(cardId)
    .then(function() {
      cardElement.remove(); // Удаляем элемент из DOM
      Modal.closePopup(deleteConfirmPopup); // Закрываем модал
    })
    .catch(function() {});
}

// Автоматическое применение имени и описания из localStorage при загрузке страницы
const savedUserData = localStorage.getItem('user-data');
if (savedUserData) {
  const data = JSON.parse(savedUserData);
  titleProfile.textContent = data.name || '';
  descriptionProfile.textContent = data.about || '';
}

// Инициализируем проверку на случай отсутствия данных при первой загрузке
const firstVisitKey = 'firstVisit';
let isFirstVisit = localStorage.getItem(firstVisitKey) !== 'false';

if (isFirstVisit) {
  const defaultValues = { name: 'Жак-Ив Кусто', about: 'Исследователь океана', avatar: '/src/images/avatar.jpg'};
  Object.assign(localStorage, defaultValues);
  localStorage.setItem(firstVisitKey, 'false'); // устанавливаем значение "не первый визит"
}

// Применение аватара прямо при старте
if (localStorage.getItem('avatar')) {
  profileImage.style.backgroundImage = `url(${localStorage.getItem('avatar')})`;
}