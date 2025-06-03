// card.js

// Элементы интерфейса
const cardTemplate = document.querySelector('#card-template');
const placesList = document.querySelector('.places__list');

// Функция создания одной карточки
function createCard({ name, link }, onClick) {
  const element = cardTemplate.content.cloneNode(true).firstElementChild;
  const imageCard = element.querySelector('.card__image');
  const titleCard = element.querySelector('.card__title');
  const likeButton = element.querySelector('.card__like-button');
  const deleteButton = element.querySelector('.card__delete-button');

  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Регистрация обработчиков событий
  imageCard.addEventListener('click', () => onClick(link, name));
  likeButton.addEventListener('click', () => toggleLike(likeButton));
  deleteButton.addEventListener('click', () => removeCard(element));

  return element;
}

// Переключение лайка
function toggleLike(buttonElement) {
  buttonElement.classList.toggle('card__like-button_is-active');
}

// Удаление карточки
function removeCard(cardElement) {
  cardElement.remove();
}

// Рендеринг начальных карточек
function renderInitialCards(cards, onClick) {
  cards.forEach((data) => placesList.append(createCard(data, onClick)));
}

// Загрузка данных пользователя в форму
function loadUserDataToForm(name, description) {
  const formElements = document.forms['edit-profile'].elements;
  formElements.name.value = name;
  formElements.description.value = description;
}

// Экспорт публичных методов
export {
  createCard,
  toggleLike,
  removeCard,
  renderInitialCards,
  loadUserDataToForm,
};