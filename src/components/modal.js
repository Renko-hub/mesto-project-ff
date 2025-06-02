// modal.js

// Элементы модальных окон
const editProfilePopup = document.querySelector('.popup.popup_type_edit');
const newPlacePopup = document.querySelector('.popup.popup_type_new-card');
const imagePopup = document.querySelector('.popup.popup_type_image');

// Открытое окно
let currentOpenedPopup = null;

// Открыть окно редактирования профиля
function openEditProfilePopup() {
  editProfilePopup.classList.add('popup_is-opened');
  currentOpenedPopup = editProfilePopup;
  document.addEventListener('keydown', closeEscPopup);
}

// Открыть окно добавления карточки
function openNewPlacePopup() {
  newPlacePopup.classList.add('popup_is-opened');
  currentOpenedPopup = newPlacePopup;
  document.addEventListener('keydown', closeEscPopup);
}

// Открыть окно с изображением
function openImagePopup() {
  imagePopup.classList.add('popup_is-opened');
  currentOpenedPopup = imagePopup;
  document.addEventListener('keydown', closeEscPopup);
}

// Закрыть любое активное окно
function closePopup() {
  if (currentOpenedPopup) {
    currentOpenedPopup.classList.remove('popup_is-opened');
    currentOpenedPopup = null;
    document.removeEventListener('keydown', closeEscPopup);
  }
}

// Закрытие окна по нажатию ESC
function closeEscPopup(event) {
  if (event.key === 'Escape') closePopup();
}

// Закрытие окна по клику на фон или кнопку закрытия
function handleOverlayClick(event) {
  const target = event.target;
  if (target.classList.contains('popup_is-opened') || target.closest('.popup__close')) closePopup();
}

// Показать увеличенное изображение
function openFullImage(src, alt) {
  const fullImageElement = imagePopup.querySelector('.popup__image');
  const captionElement = imagePopup.querySelector('.popup__caption');

  fullImageElement.src = src;
  fullImageElement.alt = alt;
  captionElement.textContent = alt;

  openImagePopup();
}

// Экспорт функций
export {
  openEditProfilePopup,
  openNewPlacePopup,
  closePopup,
  handleOverlayClick,
  openFullImage
};