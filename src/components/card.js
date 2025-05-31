// card.js

// Экспортированная функция createCard
function createCard(cardData, onLikeHandler) {
  const template = document.querySelector('#card-template');
  const element = template.content.cloneNode(true).firstElementChild;

  // Заполняем поля карточки
  element.querySelector('.card__image').src = cardData.link;
  element.querySelector('.card__image').alt = cardData.name;
  element.querySelector('.card__title').textContent = cardData.name;

  // Найдем кнопку лайка
  const likeButton = element.querySelector('.card__like-button');

  // Присваиваем состояние лайка исходя из переданных данных
  if (cardData.isLikedByCurrentUser) {
    likeButton.classList.add('card__like-button_is-active');
  }

  // Привяжем обработчик лайка
  likeButton.addEventListener('click', () => {
    onLikeHandler(likeButton);
  });

  // Связываем кнопку удаления с обработчиком
  const deleteButton = element.querySelector('.card__delete-button');
  deleteButton.addEventListener('click', () => {
    removeCard(element); // Внешний вызов функции removeCard
  });

  return element;
}

// Функционал лайка карточки
function handleCardLike(buttonElement) {
  buttonElement.disabled = true;

  if (buttonElement.classList.contains('card__like-button_is-active')) {
    // Убираем лайк
    buttonElement.classList.remove('card__like-button_is-active');
  } else {
    // Ставим лайк
    buttonElement.classList.add('card__like-button_is-active');
  }

  buttonElement.disabled = false;
}

// Удаление карточки
function removeCard(cardElement) {
  cardElement.remove();
}

// Первая отрисовка карточек
function renderInitialCards(initialCardsArray) {
  initialCardsArray.forEach((cardData) => {
    const newCard = createCard(cardData, handleCardLike);
    document.querySelector('.places__list').appendChild(newCard);
  });
}

// Групповой экспорт всех функций
export {
  createCard,
  handleCardLike,
  removeCard,
  renderInitialCards
};