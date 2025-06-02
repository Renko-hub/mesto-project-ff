// modal.js

// Элементы модальных окон
const popupEditProfile = document.querySelector('.popup.popup_type_edit');
const popupAddNewPlace = document.querySelector('.popup.popup_type_new-card');
const popupFullImage = document.querySelector('.popup.popup_type_image');

// Открытое окно
let activePopup = null;

// Открыть окно редактирования профиля
function openEditProfilePopup() {
  popupEditProfile.classList.add('popup_is-opened');
  activePopup = popupEditProfile;
  document.addEventListener('keydown', closePopupByESC);
}

// Открыть окно добавления карточки
function openAddNewPlacePopup() {
  popupAddNewPlace.classList.add('popup_is-opened');
  activePopup = popupAddNewPlace;
  document.addEventListener('keydown', closePopupByESC);
}

// Открыть окно с изображением
function openFullImagePopup() {
  popupFullImage.classList.add('popup_is-opened');
  activePopup = popupFullImage;
  document.addEventListener('keydown', closePopupByESC);
}

// Закрыть любое активное окно
function closePopup() {
  if (activePopup) {
    activePopup.classList.remove('popup_is-opened');
    activePopup = null;
    document.removeEventListener('keydown', closePopupByESC);
  }
}

// Закрытие окна по нажатию ESC
function closePopupByESC(event) {
  if (event.key === 'Escape') closePopup();
}

// Закрытие окна по клику на фон или кнопку закрытия
function handleOverlayClick(event) {
  const target = event.target;
  if (target.classList.contains('popup_is-opened') || target.closest('.popup__close')) closePopup();
}

// Показать увеличенное изображение
function openFullImage(imageSrc, imageAlt) {
  const fullImageElement = popupFullImage.querySelector('.popup__image');
  const captionElement = popupFullImage.querySelector('.popup__caption');

  fullImageElement.src = imageSrc;
  fullImageElement.alt = imageAlt;
  captionElement.textContent = imageAlt;

  openFullImagePopup();
}

// Экспорт функций
export {
  openEditProfilePopup,
  openAddNewPlacePopup,
  closePopup,
  handleOverlayClick,
  openFullImage
};