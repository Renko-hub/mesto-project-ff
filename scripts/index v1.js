// @todo: Темплейт карточки
Функия, пробежит по массиву, вернёт массив тимплейтов с СРЦ - скопировать (мапнуть)

<template id="card-template">
  <li class="places__item card">
    <img class="card__image" src="https://pictures.s3.yandex.net/frontend-developer/cards-compressed/arkhyz.jpg" alt="" />
    <button type="button" class="card__delete-button"></button>
    <div class="card__description">
      <h2 class="card__title">
      </h2>
      <button type="button" class="card__like-button"></button>
    </div>
  </li>

// @todo: DOM узлы
const cardTemplate = document,querySelector ('card-template'); //выбераем ul
const placeList = document.querySelector('place_list');


// @todo: Функция удаления карточки

// @todo: Вывести карточки на страницу - должна в плейс лист должна апенднуть в плейлист массив тимплейтов с СРЦ
function createTemplate (НОВЫЙ МАССИВ тимплейтов){
 
}

Добавить через

const list = document.querySelector('.todo-list');

const listItem1 = document.createElement('li');
const listItem2 = document.createElement('li');
const listItem3 = document.createElement('li');

list.append(listItem1, listItem2, listItem3);




const list = document.querySelector('.todo-list');

// массив дел на сегодня
const tasks = [
  'Сделать проектную работу',
  'Погулять с собакой',
  'Пройти туториал по Реакту'
];

// создадим из массива дел массив элементов
const taskElements = [];
for (let i = 0; i < tasks.length; i++) {
  const listItem = document.createElement('li');
  listItem.textContent = tasks[i];
    taskElements[i] = listItem;
}

// добавим элементы в DOM с использованием цикла
for (let i = 0; i < taskElements.length; i++) {
    list.append(taskElements[i])
}




// main.js
document.addEventListener('DOMContentLoaded', () => {
  const placesList = document.querySelector('.places__list');

  // Функция создания карточки
  function createCard({ name, link }) {
    const card = document.createElement('li');
    card.className = 'places__item card';

    const img = document.createElement('img');
    img.className = 'card__image';
    img.src = link;
    img.alt = name;

    const descriptionBlock = document.createElement('div');
    descriptionBlock.className = 'card__description';

    const title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = name;

    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'card__like-button';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'card__delete-button';

    // Добавляем все элементы в описание карточки
    descriptionBlock.append(title, likeBtn);
    card.append(img, descriptionBlock, delBtn);

    // Функция удаления карточки
    delBtn.addEventListener('click', () => card.remove());

    return card;
  }

  // Перебор массива и добавление карточек на страницу
  initialCards.forEach((data) => {
    const card = createCard(data);
    placesList.append(card);
  });
});