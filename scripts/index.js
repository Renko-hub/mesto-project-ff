// @todo: Темплейт карточки
const cardTemplate = document.querySelector('#card-template').content;

// @todo: DOM узлы
const placesList = document.querySelector('.places__list');

// @todo: Функция создания карточки
function createCard(cardData) {
  const newCard = cardTemplate.cloneNode(true).firstElementChild;
  const cardImage = newCard.querySelector('.card__image');
  const cardTitle = newCard.querySelector('.card__title');
  const deleteButton = newCard.querySelector('.card__delete-button');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  // Присваиваем обработчик удаления, передавая callback функцию
  deleteButton.addEventListener('click', () => {
    removeCard(newCard);
  });

  return newCard;
}

// @todo: Функция удаления карточки
function removeCard(cardElement) {
  cardElement.remove();
}

// @todo: Вывести карточки на страницу
function renderInitialCards() {
  initialCards.forEach((cardData) => {
    const newCard = createCard(cardData);
    placesList.appendChild(newCard);
  });
}

// Вызываем функцию рендеринга карточек при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  renderInitialCards();
});