// modal.js

// Кэшируем элементы DOM для последующего использования
const deleteConfirmPopup = document.querySelector('.popup.popup_type_delete-confirm');

// Общий метод для открытия модальных окон
function openModalWindow(popupElement, options = {}) {
  if (!popupElement) return;

  popupElement.classList.add('popup_is-opened');

  // Определяем стандартизированные параметры
  const confirmButton = popupElement.querySelector(options.confirmButtonSelector || '.popup__button_confirm');
  const cancelButton = popupElement.querySelector(options.cancelButtonSelector || '.popup__close');

  // Настроим слушатели для кнопки подтверждения и закрытия
  if (confirmButton) {
    confirmButton.addEventListener('pointerdown', (evt) => {
      evt.preventDefault();
      if (options.handleAction) {
        options.handleAction();
      }
      closePopup(popupElement);
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('pointerdown', (evt) => {
      evt.preventDefault();
      closePopup(popupElement); // Закрываем окно
    });
  }

  // Обработчики событий клавиатуры и внешнего клика
  document.addEventListener('keydown', handleKeyDown);
  popupElement.addEventListener('pointerdown', (evt) => {
    if (evt.target === popupElement) {
      closePopup(popupElement);
    }
  });
}

// Метод для закрытия модального окна
function closePopup(popupElement) {
  if (!popupElement || !popupElement.classList.contains('popup_is-opened')) return;

  popupElement.classList.remove('popup_is-opened');
  clearEventListeners(popupElement);
}

// Очистка зарегистрированных динамических обработчиков событий
function clearEventListeners(popupElement) {
  document.removeEventListener('keydown', handleKeyDown);
  popupElement.removeEventListener('pointerdown', handleOutsideClick);
}

// Обработчик нажатий клавиш (Esc)
function handleKeyDown(evt) {
  if (evt.key === 'Escape') {
    closePopup(deleteConfirmPopup);
  }
}

// Обработчик клика вне активной области модала
function handleOutsideClick(evt) {
  if (evt.target === deleteConfirmPopup) {
    closePopup(deleteConfirmPopup);
  }
}

// Менеджер состояния кнопки
function manageButtonState(button, disabled = true, textLoading = true) {
  if (disabled) {
    button.classList.add('popup__button_disabled');
    button.disabled = true;
    if (textLoading) {
      button.textContent = 'Сохранение...';
    }
  } else {
    button.classList.remove('popup__button_disabled');
    button.disabled = false;
    if (textLoading) {
      button.textContent = 'Сохранить';
    }
  }
}

// Экспорт всех используемых функций
export {
  openModalWindow,
  closePopup,
  manageButtonState
};