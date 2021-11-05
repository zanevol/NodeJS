const fs = require('fs');
const readline = require('readline');

const INP_PATH = './logs/access-short.log'
const OUT_PATH = './logs/'
const [, , ...args] = process.argv;

// валидируем введенные данные
if (!validate(args)) return;

// открываем поток для чтения
const readStream = fs.createReadStream(INP_PATH, {
    encoding: 'utf-8'
});

// создаем потоки для записи
const maps = new Map();
args.forEach(item => {
    const writeStream = fs.createWriteStream(
        `${OUT_PATH + item}_requests.log`,
        {encoding: 'utf-8'},
    );
    maps.set(item.trim(), writeStream);
    writeStream.on('error', err => {
        console.log(err);
    })
})

const lineReader = readline.createInterface({
    input: readStream,
})

// читаем построчно
lineReader.on('line', (input) => {
    let contain = '';
    for (let i = 0; i < args.length; i++) {
        if (input.includes(args[i])) {
            contain = args[i];
            break;
        }
    }
    if (contain) {
        // достаем нужный поток из maps
        const writeStream = maps.get(contain);
        if (writeStream) {
            writeStream.write(input + '\n');
        }
    }
})

readStream.on('error', err => {
    console.log(err);
});

/**
 * Валидация введенных данных
 * @param args {Array} - массив ip-адресов
 * @returns {boolean} - true, если валидация пройдена, иначе false
 */
function validate(args) {
    if (args.length === 0) {
        console.error(new Error('Введите ip-адреса'));
        return false;
    }

    for (let i = 0; i < args.length; i++) {
        const ip = args[i];
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip.trim())) {
            console.error(new Error(`Неправильно введен ip-адрес: ${ip}`));
            return false;
        }
    }
    return true;
}


