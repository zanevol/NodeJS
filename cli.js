#!/usr/local/bin/node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const yargs = require('yargs');
const inquirer = require('inquirer');

/**
 * -p, --path, --dir - необязательный параметр, определяет путь начальной директории
 */
const options = yargs
    .usage('Usage: -p <path to the directory>')
    .option('p', {
        alias: ['path', 'dir'],
        describe: 'Path to the directory',
        type: 'string',
        demandOption: false,
        default: ''
    })
    .argv;

const executionDir = path.resolve(process.cwd(), options.p);

choose(executionDir);

/**
 * выбор файла
 * @param dir {String} - директория
 */
function choose(dir) {
    const list = fs.readdirSync(dir);
    const rootDir = path.resolve(dir, '../');
    if (rootDir !== dir) {
        list.unshift('..');
    }
    inquirer.prompt([
        {
            name: 'fileName',
            type: 'list', // input, number, confirm, list, checkbox, password
            message: 'Выберите файл',
            choices: list,
            loop: false,
        },
    ])
        .then(({fileName}) => {
            const fullPath = path.join(dir, fileName);
            // если выбрана директория, заходим в нее
            if (fs.lstatSync(fullPath).isDirectory()) {
                choose(path.join(dir, fileName));
            } else {
                useTemplate(fullPath);
            }
        });
}

/**
 * Читает файл и выводит в консоль
 * @param path {String} - путь к файлу
 */
function readFile(path) {
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) console.log(err);
        else console.log(data);
    });
}

/**
 * Спрашиваем пользователя, будем ли использовать шаблон для поиска строки в файле
 * @param path {String} - путь к файлу
 */
function useTemplate(path) {
    inquirer.prompt([
        {
            name: 'uTemplate',
            type: 'confirm', // input, number, confirm, list, checkbox, password
            message: 'Хотите задать шаблон для поиска?',
        },
    ])
        .then(({ uTemplate }) => {
            if (uTemplate) {
                setTemplate(path)
            } else {
                readFile(path)
            }
        })
}

/**
 * Задает шаблон для поиска строки в файле
 * @param path {String} - путь к файлу
 */
function setTemplate(path) {
    inquirer.prompt([
        {
            name: 'template',
            type: 'input', // input, number, confirm, list, checkbox, password
            message: 'Задайте шаблон: ',
        },
    ])
        .then( ({ template }) => {
            readTemplateFile(path, template)
        })
}

/**
 * Читает строки из файла по шаблону
 * @param path {String} - путь к файлу
 * @param template {String} - шаблон для поиска
 */
function readTemplateFile(path, template) {
    const readStream = fs.createReadStream(path, {
        encoding: 'utf-8'
    });
    const lineReader = readline.createInterface({
        input: readStream,
    })
    const reg = new RegExp(template, 'ig');
    let searched = false;
    lineReader.on('line', (input) => {
        if (reg.test(input)) {
            searched = true;
            console.log(input);
        }
    });
    lineReader.on('close', () => {
        if (!searched) {
            console.log('Ничего не найдено');
        }
    });
    readStream.on('error', err => {
        console.log(err);
    });
}
