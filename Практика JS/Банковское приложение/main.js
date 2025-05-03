"use strict";

const account1 = {
  owner: "Dmitrii Fokeev",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  pin: 1111,
};

const account2 = {
  owner: "Anna Filimonova",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  pin: 2222,
};

const account3 = {
  owner: "Polina Filimonova",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  pin: 3333,
};

const account4 = {
  owner: "Stanislav Ivanchenko",
  movements: [430, 1000, 700, 50, 90],
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Инициализация кнопок и всех элементов
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Движение денежных средств(пополнение и снятие)
function displayMovements(movements, sort = false) {
  containerMovements.innerHTML = "";
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (value, index) {
    const type = value > 0 ? "deposit" : "withdrawal";
    const command = value > 0 ? "Пополнение" : "Снятие";
    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">
            ${index + 1}. ${command}
          </div>
          <div class="movements__date">24/01/2037</div>
          <div class="movements__value">${value}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}
displayMovements(account1.movements);

// Создание логина (из инициалов)
function createLogIn(accounts) {
  accounts.forEach((account) => {
    account.logIn = account.owner
      .toLowerCase()
      .split(" ")
      .map((value) => {
        return value[0];
      })
      .join("");
  });
}
createLogIn(accounts);

// Общий баланс
function total(account) {
  let balance = account.movements.reduce(function (acc, value) {
    return acc + value;
  });
  labelBalance.textContent = `${balance} RUB`;
  account.balance = balance;
}

// приход уход и сумма из footer
function calcMovements(movements) {
  const sumIn = movements
    .filter(function (sum) {
      return sum > 0;
    })
    .reduce(function (acc, sum) {
      return acc + sum;
    });
  labelSumIn.textContent = sumIn;

  const sumOut = movements
    .filter(function (sum) {
      return sum < 0;
    })
    .reduce(function (acc, sum) {
      return acc + sum;
    });
  labelSumOut.textContent = sumOut;
  labelSumInterest.textContent = sumIn + sumOut;
}
calcMovements(account1.movements);

// функция обновления UI
function updateUi(account) {
  displayMovements(account.movements);
  total(account);
  calcMovements(account.movements);
}

// Вход в аккаунт из header
let currentAccount;
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAccount = accounts.find(function (acc) {
    return acc.logIn === inputLoginUsername.value;
  });
  console.log(currentAccount);

  if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 100;
    inputLoginPin.value = inputLoginUsername.value = "";
    console.log("pin Ok");
    updateUi(currentAccount);
  }
});

// Перевод средств

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const reciveAcc = accounts.find(function (acc) {
    return acc.logIn === inputTransferTo.value;
  });
  inputTransferTo.value;
  const amount = Number(inputTransferAmount.value);
  if (
    reciveAcc &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    reciveAcc.logIn !== currentAccount.logIn
  ) {
    currentAccount.movements.push(-amount);
    reciveAcc.movements.push(amount);
    updateUi(currentAccount);
    inputTransferTo.value = inputTransferAmount.value = "";
  }
});

// закрыть aккаунт

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.logIn &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(function (account) {
      return account.logIn === currentAccount.logIn;
    });
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = "";
  }
});

// внесение суммы

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0) {
    currentAccount.movements.push(amount);
    updateUi(currentAccount);
    inputLoanAmount.value = "";
  }
});

// фильтр в footer
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
