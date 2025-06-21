// Проверяет наличие хотя бы одного неверного элемента
const hasInvalidInput = (inputList) =>
  inputList.some((input) => !input.validity.valid);

// Отображает ошибку рядом с указанным полем ввода
const showInputError = ({ inputElement, inputErrorClass, errorClass, message }) => {
  const errorElement = document.getElementById(`${inputElement.id}-error`);
  if (errorElement) {
    errorElement.classList.add(inputErrorClass, errorClass);
    errorElement.textContent = message || inputElement.validationMessage || '';
  }
};

// Убирает отображение ошибки для заданного поля
const hideInputError = ({ inputElement, inputErrorClass, errorClass }) => {
  const errorElement = document.getElementById(`${inputElement.id}-error`);
  if (errorElement) {
    errorElement.classList.remove(inputErrorClass, errorClass);
    errorElement.textContent = '';
  }
};

// Валидирует отдельное поле и показывает соответствующую ошибку
const checkInputValidity = ({ formElement, inputElement, inputErrorClass, errorClass }) => {
  const isPatternMismatch = inputElement.dataset.errorMessage && inputElement.validity.patternMismatch;
  const customMessage = isPatternMismatch ? inputElement.dataset.errorMessage : undefined;

  if (!inputElement.validity.valid) {
    showInputError({ inputElement, inputErrorClass, errorClass, message: customMessage });
  } else {
    hideInputError({ inputElement, inputErrorClass, errorClass });
  }
};

// Изменяет доступность кнопки отправки формы в зависимости от валидности полей
const toggleButtonState = ({ inputList, submitButtonElement, inactiveButtonClass }) => {
  const valid = inputList.every((input) => input.validity.valid);
  submitButtonElement.disabled = !valid;
  submitButtonElement.classList.toggle(inactiveButtonClass, !valid);
};

// Очищает все элементы ошибок формы и возвращает исходное состояние
const clearValidation = (formElement, { inputSelector, submitButtonSelector, inactiveButtonClass, inputErrorClass, errorClass }) => {
  const inputs = Array.from(formElement.querySelectorAll(inputSelector));
  const submitButtonElement = formElement.querySelector(submitButtonSelector);

  inputs.forEach((inputElement) => hideInputError({ inputElement, inputErrorClass, errorClass }));
  toggleButtonState({ inputList: inputs, submitButtonElement, inactiveButtonClass });
};

// Запускает валидацию для всех указанных форм
const enableValidation = ({ formSelector, inputSelector, submitButtonSelector, inactiveButtonClass, inputErrorClass, errorClass }) => {
  const forms = document.querySelectorAll(formSelector);

  forms.forEach((formElement) => {
    formElement.addEventListener('submit', (event) => event.preventDefault());

    const inputList = Array.from(formElement.querySelectorAll(inputSelector));
    const submitButtonElement = formElement.querySelector(submitButtonSelector);

    clearValidation(formElement, { inputSelector, submitButtonSelector, inactiveButtonClass, inputErrorClass, errorClass });

    inputList.forEach((inputElement) => {
      inputElement.addEventListener('input', () => {
        checkInputValidity({ formElement, inputElement, inputErrorClass, errorClass });
        toggleButtonState({ inputList, submitButtonElement, inactiveButtonClass });
      });
    });
  });
};

// Экспорт функций
export {
  hasInvalidInput,
  showInputError,
  hideInputError,
  checkInputValidity,
  toggleButtonState,
  clearValidation,
  enableValidation,
};