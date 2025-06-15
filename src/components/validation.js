// validation.js

// Конфигурация по умолчанию для валидатора
const defaultConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// Проверка обязательного заполнения поля
function checkRequired(value) {
  return value.trim().length > 0;
}

// Проверка допустимых символов
function checkValidCharacters(value) {
   return /^[A-Za-zА-Яа-яЁё]+([- ][A-Za-zА-Яа-яЁё]+)*$/.test(value);
}

// Проверка формата URL
function checkValidUrl(value) {
  return /(^(?:http|https):\/\/[^\s]+)/i.test(value);
}

// Проверка поля "Имя"
function validateName(value) {
  if (!checkRequired(value)) return 'Вы пропустили это поле.';
  if (!checkValidCharacters(value)) return 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы.';
  if (value.length < 2 || value.length > 40) return 'В этом поле должно быть от 2 до 40 символов.';
  return '';
}

// Проверка поля "Название места"
function validatePlaceName(value) {
  if (!checkRequired(value)) return 'Вы пропустили это поле.';
  if (!checkValidCharacters(value)) return 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы.';
  if (value.length < 2 || value.length > 30) return 'В этом поле должно быть от 2 до 30 символов.';
  return '';
}

// Проверка поля "Описание"
function validateDescription(value) {
  if (!checkRequired(value)) return 'Вы пропустили это поле.';
  if (!checkValidCharacters(value)) return 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы.';
  if (value.length < 2 || value.length > 200) return 'В этом поле должно быть от 2 до 200 символов.';
  return '';
}

// Проверка поля "Ссылка"
function validateLink(value) {
  if (!checkRequired(value)) return 'Введите адрес сайта.'; // Исправленное условие
  if (!checkValidUrl(value)) return 'Введите адрес в формате http:// или https://';
  return '';
}

// Универсальная функция валидации любого поля
function validateField(field, config) {
  const value = field.value.trim();

  // Выбор подходящей функции валидации в зависимости от имени поля
  switch (field.name) {
    case 'name': return validateName(value);
    case 'place-name': return validatePlaceName(value);
    case 'description': return validateDescription(value);
    case 'link': return validateLink(value);
    default: return '';
  }
}

// Обновляет статус одного поля и показывает/снимает ошибки
function updateInputStatus(input, config) {
  const errorMessage = validateField(input, config);

  if (errorMessage) {
    input.classList.add(config.inputErrorClass);
    input.setAttribute('data-error-message', errorMessage);

    // Находим или создаем блок ошибки
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

    // Удаляем блок ошибки, если он есть
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('popup__error')) {
      errorElement.remove();
    }
  }
}

// Проверяет всю форму и блокирует/разблокирует кнопку отправки
function checkButtonState(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);
  const submitButton = form.querySelector(config.submitButtonSelector);

  let hasErrors = false;

  inputs.forEach(input => {
    const errorMessage = validateField(input, config);
    if (errorMessage) hasErrors = true;
  });

  if (hasErrors) {
    submitButton.classList.add(config.inactiveButtonClass);
    submitButton.disabled = true;
  } else {
    submitButton.classList.remove(config.inactiveButtonClass);
    submitButton.disabled = false;
  }
}

// Включает глобальную проверку всех форм
function enableValidation(config = {}) {
  const mergedConfig = Object.assign({}, defaultConfig, config);

  const forms = document.querySelectorAll(mergedConfig.formSelector);

  forms.forEach(form => {
    const inputs = form.querySelectorAll(mergedConfig.inputSelector);
    const submitButton = form.querySelector(config.submitButtonSelector);

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        updateInputStatus(input, mergedConfig);
        checkButtonState(form, mergedConfig);
      });

      input.addEventListener('blur', () => {
        checkButtonState(form, mergedConfig);
      });
    });

    checkButtonState(form, mergedConfig);
  });
}

// Экспорт функций модуля
export { validateField, enableValidation, updateInputStatus, checkButtonState, defaultConfig };