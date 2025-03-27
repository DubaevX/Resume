"use strict";

class Card {
  constructor(src, alt, price, oldPrice, type, descr, parent) {
    this.src = src;
    this.alt = alt;
    this.price = price;
    this.oldPrice = oldPrice;
    this.type = type;
    this.descr = descr;
    this.parent = parent;
    this.sale = Math.round((this.price / this.oldPrice) * 100 - 100);
  }
  render() {
    document.querySelector(this.parent).insertAdjacentHTML(
      "beforeend",
      `
    <div class="card">
          <img class="card__img" src="${this.src}" alt="${this.alt}" />
          <div class="card__sale">${this.sale}%</div>
          <div class="card__price">
            ${this.price}р<span class="card__old-Price"> <s>${this.oldPrice}р</s> </span>
          </div>
          <div class="card__type">${this.type}</div>
          <div class="card__descr">${this.descr}</div>
        </div>
    `
    );
  }
}

document.querySelector(".btn").addEventListener("click", function () {
  for (let i = 2; i <= 6; i++) {
    new Card(
      `img/tv-${i}.png`,
      "tv",
      19990,
      22990,
      "Акция",
      "Лучший тв в мире",
      ".cards"
    ).render();
  }
});
