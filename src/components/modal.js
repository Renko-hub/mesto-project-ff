// modal.js

// Функция открытия модального окна
const openModal = (modalElement) => {
  return new Promise((resolve) => {
    modalElement.classList.add('popup_is-opened');
    
    // Добавляем обработчики событий клавиатуры и мыши
    document.addEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('pointerdown', handleModalPointerdown);
  
    resolve();
  });
};

// Функция закрытия модального окна
const closeModal = (modalElement) => {
  return new Promise((resolve) => {
    modalElement.classList.remove('popup_is-opened');
    
    // Удаляем обработчики событий клавиатуры и мыши
    document.removeEventListener('keydown', handleDocumentKeydown);
    document.removeEventListener('pointerdown', handleModalPointerdown);
  
    resolve();
  });
};

// Обработчик события нажатия клавиши Escape
const handleDocumentKeydown = (evt) => {
  if (evt.key === 'Escape') {
    closeModal(document.querySelector('.popup_is-opened'));
  }
};

// Обработчик кликов мыши для закрытия модального окна
const handleModalPointerdown = (evt) => {
  const activeModal = evt.target.closest('.popup_is-opened');

  if (
    activeModal &&
    (activeModal === evt.target || 
     evt.target.closest('.popup__close'))
  ) {
    closeModal(activeModal);
  }
};

// Экспорт функций управления модальным окном
export { openModal, closeModal };