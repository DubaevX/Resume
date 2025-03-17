"use strict";

let number = Math.trunc(Math.random() * 20);

const button = document.querySelector(".btn.check");
let userNumber = document.querySelector(".guess"),
  score = document.querySelector(".score"),
  highScore = document.querySelector(".highscore"),
  reset = document.querySelector(".btn.again"),
  message = document.querySelector(".message"),
  numberRes = document.querySelector(".number");
let userValue;

userNumber.addEventListener("input", () => {
  userValue = parseInt(userNumber.value);
});

button.addEventListener("click", () => {
  if (highScore.textContent == 0) {
    message.textContent = "У вас закончились попытки";
  }
  if (number == userValue) {
    message.textContent = "Вы победили!";
    numberRes.textContent = "";
    numberRes.classList.add("numberRes");
    score.textContent -= 1;
    highScore.textContent = 20 - score.textContent;
  } else if (number != userValue) {
    if (userValue > number) {
      message.textContent = `
        Вы не угадали!
        Загаданное число меньше вашего!
        `;
    } else if (userValue < number) {
      message.textContent = `
        Вы не угадали!
        Загаданное число больше вашего!
        `;
    }
    score.textContent -= 1;
  }
});

reset.addEventListener("click", () => {
  number = Math.trunc(Math.random() * 10);
  score.textContent = 20;
  userNumber.value = "";
  numberRes.textContent = "?";
  numberRes.classList.add("number");
});
