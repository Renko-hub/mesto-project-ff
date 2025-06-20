// Основная функция для создания валидатора
function validateForm(config, formElement) {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  // Метод для отображения ошибки
  function showInputError(inputElement) {
    const errorSpan = inputElement.nextElementSibling;

    // Кастомное сообщение, если шаблон неправильный
    let customErrorMessage = '';
    if (inputElement.validity.patternMismatch && inputElement.hasAttribute('data-error-message')) {
      customErrorMessage = inputElement.getAttribute('data-error-message');
    }

    // Итоговое сообщение
    const finalErrorMessage = customErrorMessage || inputElement.validationMessage;

    // Печать ошибки
    errorSpan.textContent = finalErrorMessage;
    errorSpan.classList.add(config.inputErrorClass); // Класс ошибки
    errorSpan.classList.add(config.errorClass); // Видимость ошибки
  }

  // Метод для скрытия ошибки
  function hideInputError(inputElement) {
    const errorSpan = inputElement.nextElementSibling;
    errorSpan.textContent = '';
    errorSpan.classList.remove(config.errorClass); // Скрываем ошибку
  }

  // Проверка наличия неверных полей
  function hasInvalidInput() {
    return inputList.some(inputElement => !inputElement.validity.valid);
  }

  // Переключение состояния кнопки
  function toggleButtonState() {
    if (hasInvalidInput()) {
      buttonElement.classList.add(config.inactiveButtonClass); // Блокируем кнопку
      buttonElement.disabled = true;
    } else {
      buttonElement.classList.remove(config.inactiveButtonClass); // Разблокируем кнопку
      buttonElement.disabled = false;
    }
  }

  // Добавляем обработчик на каждое изменение ввода
  function setupInputListeners() {
    inputList.forEach((inputElement) => {
      inputElement.addEventListener('input', () => {
        // Проверяем корректность
        if (!inputElement.validity.valid) {
          showInputError(inputElement);
        } else {
          hideInputError(inputElement);
        }

        // Обновляем состояние кнопки
        toggleButtonState();
      });
    });
  }

  // Сброс валидации при повторной отправке формы
  function resetValidation() {
    inputList.forEach((inputElement) => {
      hideInputError(inputElement);
    });
    toggleButtonState(); // Обновляем состояние кнопки
  }

  // Инициализация валидации
  function enableValidation() {
    setupInputListeners();
    toggleButtonState();
  }

  return {
    enableValidation,
    resetValidation,
    toggleButtonState
  };
}

// Вспомогательные функции
function checkButtonState(form, config) {
  const validatorInstance = validateForm(config, form);
  validatorInstance.toggleButtonState();
}

function clearValidation(form, config) {
  const validatorInstance = validateForm(config, form);
  validatorInstance.resetValidation();
}

function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);

  forms.forEach((form) => {
    const validatorInstance = validateForm(config, form);
    validatorInstance.enableValidation();
  });
}

// Групповой экспорт всех методов и интерфейса валидации
export {
  validateForm,
  checkButtonState,
  clearValidation,
  enableValidation
};