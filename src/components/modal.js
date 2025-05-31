// modal.js

// Обработчик открытия модальных окон
function openModal(element) {
  element.classList.add('popup_is-opened');
  document.addEventListener('keydown', handleDocumentKeydown);
}

// Обработчик закрытия модальных окон
function closeModal(element) {
  element.classList.remove('popup_is-opened');
  document.removeEventListener('keydown', handleDocumentKeydown);
}

// Обработчик нажатия на Esc
function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    const currentOpenPopup = document.querySelector('.popup_is-opened');
    if (currentOpenPopup) {
      closeModal(currentOpenPopup);
    }
  }
}

// Обработчик кликов на модальных окнах
function handleModalClick(event) {
  const targetClasses = event.target.classList;

  // Если нажали на фон или крестик
  if (
    targetClasses.contains('popup_is-opened') ||
    event.target.closest('.popup__close')
  ) {
    closeModal(event.target.closest('.popup'));
  }
}

// Функция показа изображения в модальном окне
function showImagePopup(imageSrc, titleText) {
  const img = document.querySelector('.popup__image');
  const caption = document.querySelector('.popup__caption');

  img.src = imageSrc;
  img.alt = titleText;
  caption.textContent = titleText;

  openModal(document.querySelector('.popup.popup_type_image'));
}

// Групповой экспорт всех функций
export {
  openModal,
  closeModal,
  handleDocumentKeydown,
  handleModalClick,
  showImagePopup
};