// card.js

// Элементы интерфейса, относящиеся к карточкам
const templateCard = document.querySelector('#card-template');
const listPlaces = document.querySelector('.places__list');

// Создаем одну карточку
function createCard({ name, link }, openFullImageCallback) { // получает callback
  const element = templateCard.content.cloneNode(true).firstElementChild;
  const imageCard = element.querySelector('.card__image');
  const titleCard = element.querySelector('.card__title');
  const buttonLikeCard = element.querySelector('.card__like-button');
  const buttonDeleteCard = element.querySelector('.card__delete-button'); // Правильно выбрали кнопку удаления

  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Регистрация обработчиков событий
  imageCard.addEventListener('click', () => openFullImageCallback(link, name)); // вызываем callback
  buttonLikeCard.addEventListener('click', () => handleCardLike(buttonLikeCard));
  buttonDeleteCard.addEventListener('click', () => removeCard(element)); // правильный обработчик удаления

  return element;
}

// Переключает лайк
function handleCardLike(buttonElement) {
  buttonElement.classList.toggle('card__like-button_is-active');
}

// Удаляет карточку
function removeCard(cardElement) {
  cardElement.remove();
}

// Рендерит начальные карточки
function renderInitialCards(cards, openFullImageCallback) { // принимает callback
  cards.forEach((data) => listPlaces.append(createCard(data, openFullImageCallback))); // передаем callback
}

// Загружает данные пользователя в форму
function loadUserDataToForm(name, description) {
  const formElements = document.forms['edit-profile'].elements;
  formElements.name.value = name;
  formElements.description.value = description;
}

// Экспорт функций
export {
  createCard,
  handleCardLike,
  removeCard,
  renderInitialCards,
  loadUserDataToForm
};