// validation.js

// Регулярное выражение теперь локализовано внутри функции
function validateField(field) {
  const value = field.value.trim();
  const validCharsRegex = /^[A-Za-zА-Яа-яЁё\s-]*$/;

  if (field.type === 'text' && value.length > 0 && !validCharsRegex.test(value)) {
    return 'Неверный формат. Допускаются только буквы, дефис и пробел.';
  }

  return '';
}

// Обновляет статус поля и отображает ошибки
function updateInputStatus(input, config) {
  const errorMessage = validateField(input);

  if (errorMessage) {
    input.classList.add(config.inputErrorClass);
    input.setAttribute('data-error-message', errorMessage);

    // Если элемент ошибки уже существует, используем его,
    // иначе создаем новый
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

    // Удаляем элемент ошибки, если он есть
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('popup__error')) {
      errorElement.remove();
    }
  }
}

// Включает/отключает кнопку формы в зависимости от валидности полей
function checkButtonState(form, config) {
  const submitButton = form.querySelector(config.submitButtonSelector);
  const inputs = form.querySelectorAll(config.inputSelector);

  let isValid = true;
  inputs.forEach(input => {
    const errMsg = validateField(input);
    if (errMsg || input.value.trim() === '') {
      isValid = false;
    }
  });

  submitButton.disabled = !isValid;
  submitButton.classList.toggle(config.inactiveButtonClass, !isValid);
}

// Очищает поле ввода и удаляет ошибку
function clearValidation(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);

  inputs.forEach((input) => {
    input.classList.remove(config.inputErrorClass);
    input.removeAttribute('data-error-message');

    // Удаляем блок ошибки, если он есть
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('popup__error')) {
      errorElement.remove();
    }
  });

  const submitButton = form.querySelector(config.submitButtonSelector);
  submitButton.disabled = true;
  submitButton.classList.add(config.inactiveButtonClass);
}

// Подключение валидации форм
function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);

  forms.forEach((form) => {
    const inputs = form.querySelectorAll(config.inputSelector);

    inputs.forEach((input) => {
      input.addEventListener('input', (evt) => {
        updateInputStatus(input, config);
        checkButtonState(form, config);
      });

      // Обрабатываем ситуацию, когда браузер сам показывает встроенную ошибку
      input.addEventListener('invalid', (evt) => {
        evt.preventDefault(); // Предотвращаем стандартное поведение браузера

        // Проверяем наличие элемента ошибки и устанавливаем его
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('popup__error')) {
          errorElement = document.createElement('div');
          errorElement.classList.add('popup__error');
          input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        errorElement.textContent = input.validationMessage;
        errorElement.classList.add(config.errorClass);
      });
    });

    checkButtonState(form, config); // Начальная проверка состояния кнопки
  });
}

// Экспорт функций (при необходимости)
export { validateField, updateInputStatus, checkButtonState, clearValidation, enableValidation };