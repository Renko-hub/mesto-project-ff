// validation.js

// Регулярное выражение для проверки разрешённых символов
const validCharsRegex = /^[A-Za-zА-Яа-яЁё\s-]*$/;

// Валидаторы и обработка ошибок
function validateField(field, config) {
  // Проверяет содержание поля на соответствие требованиям валидации
  const value = field.value.trim();
  if (field.type === 'text' && value.length > 0 && !validCharsRegex.test(value)) {
    return 'Допустимы только латиница, кириллица, дефис и пробел';
  }
  return '';
}

function updateInputStatus(input, config) {
  // Показывает или скрывает ошибки в полях формы
  const errorMessage = validateField(input, config);
  if (errorMessage) {
    input.classList.add(config.inputErrorClass);
    input.setAttribute('data-error-message', errorMessage);
    // Создание и вставка блока с текстом ошибки
    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('popup__error')) {
      errorElement = document.createElement('div');
      errorElement.classList.add('popup__error');
      input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
  } else {
    input.classList.remove(config.inputErrorClass);
    input.removeAttribute('data-error-message');
    // Удаление существующего блока с ошибкой
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('popup__error')) {
      errorElement.remove();
    }
  }
}

// Управление кнопкой отправки
function checkButtonState(form, config) {
  // Включает или выключает кнопку отправки в зависимости от правильности заполнения формы
  const submitButton = form.querySelector(config.submitButtonSelector);
  const inputs = form.querySelectorAll(config.inputSelector);

  let isValid = true;
  inputs.forEach(input => {
    const errMsg = validateField(input, config);
    if (errMsg || input.value === '') {
      isValid = false;
    }
  });

  submitButton.disabled = !isValid;
  submitButton.classList.toggle(config.inactiveButtonClass, !isValid);
}

// Очистка ошибок
function clearValidation(form, config) {
  // Полностью удаляет ошибки и возвращает форму в исходное состояние
  const inputs = form.querySelectorAll(config.inputSelector);

  inputs.forEach((input) => {
    input.classList.remove(config.inputErrorClass);
    input.removeAttribute('data-error-message');

    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('popup__error')) {
      errorElement.remove();
    }
  });

  const submitButton = form.querySelector(config.submitButtonSelector);
  submitButton.disabled = true;
  submitButton.classList.add(config.inactiveButtonClass);
}

// Инициализация валидации
function enableValidation(config) {
  // Подключает обработку событий для включения валидации на всех формах
  const forms = document.querySelectorAll(config.formSelector);

  forms.forEach((form) => {
    const inputs = form.querySelectorAll(config.inputSelector);

    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        updateInputStatus(input, config);
        checkButtonState(form, config);
      });
    });

    checkButtonState(form, config);
  });
}

// Экспорт функций (при необходимости экспорта):
export { validateField, updateInputStatus, checkButtonState, clearValidation, enableValidation };