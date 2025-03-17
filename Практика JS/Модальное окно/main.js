"use strict";
///////////////////////
/* 
ЗАДАЧА:
Создайте функционал для открытия модальных окон.

ПОДСКАЗКА:
1-Не забывайте про свойство classList с помощью которого можно манипулировать классами HTML элементов
2-При добавлении класса .hidden к любому элементу, он исчезнет, при удалении этого класса, он появится
3-Не забудьте про то, что закрыть модальное окно можно как с помощью кнопки-крестика, в верхнем правом углу модального окна, так и с помощью нажатия на любое место "Оверлей"
*/

let showModal = document.querySelectorAll(".show-modal");
let modal = document.querySelector(".modal.hidden");
let closeModal = document.querySelector(".close-modal");
let overlay = document.querySelector(".overlay.hidden");

for (let value of showModal) {
  value.addEventListener("click", () => {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

overlay.addEventListener("click", () => {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
});

document.addEventListener("keydown", (event) => {
  if (event.key == "Escape") {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  }
});
