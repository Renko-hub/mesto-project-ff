// card.js

// Элементы интерфейса, относящиеся к карточкам
const template = document.querySelector('#card-template');
const placesList = document.querySelector('.places__list');

// Создаем одну карточку
function createCard({ name, link }, openFullImageCallback) { // получает callback
  const element = template.content.cloneNode(true).firstElementChild;
  const imageElement = element.querySelector('.card__image');
  const titleElement = element.querySelector('.card__title');
  const likeButton = element.querySelector('.card__like-button');
  const deleteButton = element.querySelector('.card__delete-button');

  imageElement.src = link;
  imageElement.alt = name;
  titleElement.textContent = name;

  // Регистрация обработчиков событий
  imageElement.addEventListener('click', () => openFullImageCallback(link, name)); // вызываем callback
  likeButton.addEventListener('click', () => handleCardLike(likeButton));
  deleteButton.addEventListener('click', () => removeCard(element));

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
  cards.forEach((data) => placesList.append(createCard(data, openFullImageCallback))); // передаем callback
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