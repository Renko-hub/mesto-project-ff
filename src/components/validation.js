// validation.js

// Проверяет, есть ли среди элементов списка хотя бы один неверный
const hasInvalidInput = (inputList) =>
  inputList.some((input) => !input.validity.valid);

// Показывает ошибку для указанного поля
const showInputError = ({
  inputElement,
  inputErrorClass,
  errorClass,
  customMessage,
}) => {
  const errorElementId = `${inputElement.id}-error`;
  const errorElement = document.getElementById(errorElementId);

  if (errorElement) {
    errorElement.classList.add(inputErrorClass); // popup__input_type_error
    errorElement.classList.add(errorClass); // popup__error_visible
    errorElement.textContent = customMessage || inputElement.validationMessage || '';
  }
};

// Скрывает ошибку для указанного поля
const hideInputError = ({
  inputElement,
  inputErrorClass,
  errorClass,
}) => {
  const errorElementId = `${inputElement.id}-error`;
  const errorElement = document.getElementById(errorElementId);

  if (errorElement) {
    errorElement.classList.remove(inputErrorClass); // popup__input_type_error
    errorElement.classList.remove(errorClass); // popup__error_visible
    errorElement.textContent = '';
  }
};

// Проверяет валидность отдельного поля и выводит соответствующую ошибку
const checkInputValidity = ({
  formElement,
  inputElement,
  inputErrorClass,
  errorClass,
}) => {
  // Получаем кастомное сообщение, если оно существует
  let customMessage = inputElement.dataset.errorMessage || null;

  // Проверяем, совпадают ли данные с нашим паттерном
  if (customMessage && inputElement.validity.patternMismatch) {
    // Нарушение паттерна - ставим кастомное сообщение
    showInputError({
      formElement,
      inputElement,
      inputErrorClass,
      errorClass,
      customMessage,
    });
  } else if (!inputElement.validity.valid) {
    // Другого рода нарушение (например, минимальная длина)
    showInputError({
      formElement,
      inputElement,
      inputErrorClass,
      errorClass,
    });
  } else {
    // Поле заполнено верно - скрываем ошибку
    hideInputError({
      formElement,
      inputElement,
      inputErrorClass,
      errorClass,
    });
  }
};

// Включает/выключает кнопку отправки формы в зависимости от статуса валидности полей
const toggleButtonState = ({
  inputList,
  submitButtonElement,
  inactiveButtonClass,
}) => {
  const allInputsAreValid = inputList.every((input) => input.validity.valid);

  if (allInputsAreValid) {
    submitButtonElement.disabled = false;
    submitButtonElement.classList.remove(inactiveButtonClass);
  } else {
    submitButtonElement.disabled = true;
    submitButtonElement.classList.add(inactiveButtonClass);
  }
};

// Сбрасывает состояния ошибок формы перед её повторным открытием
const clearValidation = (formElement, config) => {
  const inputs = Array.from(formElement.querySelectorAll(config.inputSelector));
  const submitButtonElement = formElement.querySelector(config.submitButtonSelector);

  inputs.forEach((inputElement) => {
    hideInputError({
      formElement,
      inputElement,
      inputErrorClass: config.inputErrorClass,
      errorClass: config.errorClass,
    });
  });

  toggleButtonState({
    inputList: inputs,
    submitButtonElement,
    inactiveButtonClass: config.inactiveButtonClass,
  });
};

// Активирует систему валидации для всех форм
const enableValidation = ({
  formSelector,
  inputSelector,
  submitButtonSelector,
  inactiveButtonClass,
  inputErrorClass,
  errorClass,
}) => {
  const forms = document.querySelectorAll(formSelector);

  forms.forEach((formElement) => {
    formElement.addEventListener('submit', (event) => {
      event.preventDefault(); // предотвратим отправку формы
    });

    const inputList = Array.from(formElement.querySelectorAll(inputSelector)); // все поля формы
    const submitButtonElement = formElement.querySelector(submitButtonSelector); // кнопка отправки

    // Первоначально скрываем все ошибки
    clearValidation(formElement, {
      inputSelector,
      submitButtonSelector,
      inactiveButtonClass,
      inputErrorClass,
      errorClass,
    });

    // Реакции на изменения в полях
    inputList.forEach((inputElement) => {
      inputElement.addEventListener('input', () => {
        checkInputValidity({
          formElement,
          inputElement,
          inputErrorClass,
          errorClass,
        });

        // Меняем состояние кнопки отправки
        toggleButtonState({
          inputList,
          submitButtonElement,
          inactiveButtonClass,
        });
      });
    });
  });
};

// Экспорт методов (при необходимости)
export {
  hasInvalidInput,
  showInputError,
  hideInputError,
  checkInputValidity,
  toggleButtonState,
  clearValidation,
  enableValidation,
};