const colors = require('colors');

let start = +process.argv[2];
let end = +process.argv[3];

// валидируем значения
if (!Number.isInteger(start) || !Number.isInteger(end)) {
    console.error(new Error('Не верный ввод. Введите два целых числа.'));
    return;
}

// start должен быть больше end
if (start > end) {
    [start, end] = [end, start];
}

// находим простые числа в заданном диапазоне
let arr = simpleNumbers(start, end);

// форматируем строку
let str = '';
arr.forEach((item, idx) => {
    if ((idx + 1) % 3 === 0) {
        str += `${item}`.red;
    } else if ((idx + 1) % 3 === 2) {
        str += `${item}`.yellow;
    } else {
        str += `${item}`.green;
    }
    str += ' ';
})

if (str.length > 0) {
    console.log(str);
} else {
    console.log('В этом диапазоне нет простых чисел'.red);
}


/**
 * Возвращает массив простых чисел
 * @param start {number} - начало диапазона
 * @param end {number} - конец диапазона
 * @returns {*[]} - массив простых чисел
 */
function simpleNumbers(start, end) {
    const arr = [];
    for (let i = start; i <= end; i++) {
        let flag = i > 1;
        for (let j = 2; j * j <= i && i > 2; j++) {
            if (i % j === 0) {
                flag = false;
                break;
            }
        }
        if (flag) {
            arr.push(i);
        }
    }
    return arr;
}
