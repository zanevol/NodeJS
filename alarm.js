const { DateTime, Duration } = require('luxon');
const notifier = require('node-notifier');
const EventEmitter = require('events');

const eventEmitter = new EventEmitter;

// события
const EVENTS = {
    updated: 'updated',
    end: 'end',
    alarm: 'alarm'
}

// подписываемся на события
eventEmitter.on(EVENTS.updated, render);
eventEmitter.on(EVENTS.updated, check);
eventEmitter.on(EVENTS.end, stopTimer);
eventEmitter.on(EVENTS.alarm, notify);

const TIME_PERIOD = 100;    //частота обновления

// формат даты
const dateFormat = 'm-h-d-L-y';

const [,, ...arg] = process.argv;

if (arg.length === 0) {
    console.error('Введите время срабатывания таймера');
    return;
}

const end = [];
const diffs = [];

// валидация
const now = DateTime.now();
for (let i = 0; i < arg.length; i++) {
    const date = DateTime.fromFormat(arg[i], dateFormat);
    if (date.invalid) {
        console.error(`Дата ${arg[i]} не соответствует формату ${dateFormat}`);
        return
    }
    end.push(date);
    diffs.push(date.diff(now));
}

const timerId = setInterval(() => {
    update();
}, TIME_PERIOD)

// обновление таймеров
function update() {
    const now = DateTime.now();
    let updated = false;
    end.forEach((item, idx) => {
        if (diffs[idx].toMillis() === 0) return;
        const diff = item.diff(now);
        if (diffs[idx].toMillis() !== 0 && diff.toMillis() <= 0 ) {
            diffs[idx] = Duration.fromMillis(0);
            updated = true
            eventEmitter.emit(EVENTS.alarm, idx + 1);
        } else if (diffs[idx].toMillis() - diff.toMillis() > 1000) {
            diffs[idx] = diff;
            updated = true
        }
    })
    if (updated) {
        eventEmitter.emit(EVENTS.updated);
    }
}

// остановка татаймера
function stopTimer() {
    clearTimeout(timerId);
    console.log('Все таймеры отработали')
}

// вывод на экран
function render() {
    console.clear();
    diffs.forEach((item,idx) => {
        if (item.toMillis() === 0) {
            console.log(`Таймер ${idx + 1} завершил работу`)
        } else {
            console.log(item.toFormat('Осталось лет: y месяцев: M дней: d часов: h минут: mm секунд: ss'));
        }
    })
}

// проверка, что все таймеры отработали
function check() {
    if (diffs.reduce((acc, item) => acc && item.toMillis() === 0, true)) {
        eventEmitter.emit(EVENTS.end);
    }
}

// уведомление от таймера
function notify(num) {
    notifier.notify(
        {
        title: `Уведомление таймера`,
        message: `Сработал таймер ${num}`,
        sound: true, // Only Notification Center or Windows Toasters
    });
}
