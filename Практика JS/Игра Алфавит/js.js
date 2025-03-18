"use strict";
/*
ЗАДАЧА:
Создайте игру "Собери алфавит"

ПОДСКАЗКИ:

1-Не думайте о сокращении кода. Если будет очень много повторений однотипного кода - это нормально. Первая задача понимать логику языка, а только после оптимизировать его.
2-Помните про методы переноса элемента из одного места в другое(before, after и т.д.)
3-Помните про свойства, получения соседних элементов (previousElementSibling, previousElementSibling и т.д)

*/

let a = document.querySelector(".box_a"),
  b = document.querySelector(".box_b"),
  c = document.querySelector(".box_c"),
  d = document.querySelector(".box_d"),
  e = document.querySelector(".box_e"),
  f = document.querySelector(".box_f");
const audio = new Audio("audio/Mountain Audio - Menu Click.mp3");
const finishAudio = new Audio("audio/huge win.wav");

let box = document.querySelector(".boxes");
a.addEventListener("click", () => {
  if (a.previousElementSibling == null) {
    box.append(a);
  }
  a.previousElementSibling.before(a);
  audio.play();
});

b.addEventListener("click", () => {
  if (b.previousElementSibling == null) {
    box.append(b);
  }
  b.previousElementSibling.before(b);
  audio.play();
});

c.addEventListener("click", () => {
  if (c.previousElementSibling == null) {
    box.append(c);
  }
  c.previousElementSibling.before(c);
  audio.play();
});

d.addEventListener("click", () => {
  if (d.previousElementSibling == null) {
    box.append(d);
  }
  d.previousElementSibling.before(d);
  audio.play();
});

e.addEventListener("click", () => {
  if (e.previousElementSibling == null) {
    box.append(e);
  }
  e.previousElementSibling.before(e);
  audio.play();
});

f.addEventListener("click", () => {
  if (f.previousElementSibling == null) {
    box.append(f);
  }
  f.previousElementSibling.before(f);
  audio.play();
});

document.addEventListener("mousemove", () => {
  if (
    a.nextElementSibling == b &&
    b.nextElementSibling == c &&
    c.nextElementSibling == d &&
    d.nextElementSibling == e &&
    e.nextElementSibling == f
  ) {
    finishAudio.play();
  }
});
