// modal.js

// Универсальная функция открытия окна
function openModal(popupElement, additionalClass = '') {
  if (!popupElement) {
    return;
  }

  popupElement.classList.add('popup_is-opened');
  if (additionalClass) {
    popupElement.classList.add(additionalClass);
  }

  document.addEventListener('keydown', closeModalESC);
}

// Универсальная функция закрытия окна
function closeModal(popupElement) {
  if (popupElement && popupElement.classList.contains('popup_is-opened')) {
    popupElement.classList.remove('popup_is-opened');
    document.removeEventListener('keydown', closeModalESC);
  }
}

// Обработчик закрытия окна клавишей Escape
function closeModalESC(event) {
  if (event.key === 'Escape') {
    const openedPopup = document.querySelector('.popup.popup_is-opened');
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
}

// Экспорт функций
export {
  openModal,
  closeModal,
  closeModalESC,
};