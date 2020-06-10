let total = 100;
let available = total;
let purchased = 1;

let price = 10;
let increase = 0.25;
let ratio = increase;

function buy () {
    purchased++;
    available--;
    price = Math.round((price + increase) * 100) / 100
    ratio = Math.round(((increase * purchased) / total) * 100) / 100
}

function calcNewPrice () {
    price -= ratio
}

function toFixed (number) {
    const exp = /(\d*.\d{2})/g;
    if (exp.test(number.toString())) {
        return Number(number.toString().match(/(\d*.\d{2})/g)[0]);
    }

    return number;
}

let i = 0;
for (; purchased < total + 1;) {
    if (i % 2 == 0) {
        calcNewPrice();
    } else {
        buy();
    }
    i++;
}

console.log(price)
