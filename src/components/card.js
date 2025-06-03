// card.js

// Элемент шаблона карточки
const cardTemplate = document.querySelector('#card-template');

// Функция создания карточки
function createCard({ name, link }, onClick) {
  const element = cardTemplate.content.cloneNode(true).firstElementChild;
  const imageCard = element.querySelector('.card__image');
  const titleCard = element.querySelector('.card__title');
  const likeButton = element.querySelector('.card__like-button');
  const deleteButton = element.querySelector('.card__delete-button');

  imageCard.src = link;
  imageCard.alt = name;
  titleCard.textContent = name;

  // Назначаем обработчики событий
  imageCard.addEventListener('click', () => onClick(link, name));
  likeButton.addEventListener('click', () => toggleLike(likeButton));
  deleteButton.addEventListener('click', () => removeCard(element));

  return element;
}

// Переключает статус лайка
function toggleLike(buttonElement) {
  buttonElement.classList.toggle('card__like-button_is-active');
}

// Удаляет карточку
function removeCard(cardElement) {
  cardElement.remove();
}

// Экспорт нужных функций
export {
  createCard,
  toggleLike,
  removeCard,
};