// modal.js

// Универсальная функция открытия окна
function showModal(popupElement, additionalClass = '') {
  if (!popupElement) {
    return;
  }

  popupElement.classList.add('popup_is-opened');
  if (additionalClass) {
    popupElement.classList.add(additionalClass);
  }

  document.addEventListener('keydown', closePopupESC);
}

// Универсальная функция закрытия окна
function closePopup(popupElement) {
  if (popupElement && popupElement.classList.contains('popup_is-opened')) {
    popupElement.classList.remove('popup_is-opened');
    document.removeEventListener('keydown', closePopupESC);
  }
}

// Обработчик закрытия окна клавишей Escape
function closePopupESC(event) {
  if (event.key === 'Escape') {
    const openedPopup = document.querySelector('.popup.popup_is-opened');
    if (openedPopup) {
      closePopup(openedPopup);
    }
  }
}

// Специфическая функция открытия окна просмотра изображения
function showFullscreenImage(imageSrc, imageAlt) {
  const viewImagePopup = document.querySelector('.popup.popup_type_image');
  if (!viewImagePopup) {
    return;
  }

  const fullImageElement = viewImagePopup.querySelector('.popup__image');
  const captionElement = viewImagePopup.querySelector('.popup__caption');

  fullImageElement.src = imageSrc;
  fullImageElement.alt = imageAlt;
  captionElement.textContent = imageAlt;

  showModal(viewImagePopup);
}

// Экспортируем публичные функции
export {
  showModal,
  closePopup,
  showFullscreenImage,
  closePopupESC,
};