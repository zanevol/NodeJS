const socket = require('socket.io');
const http = require('http');
const fs = require('fs');
const path = require('path');
const {log} = require("nodemon/lib/utils");

const server = http
    .createServer(((req, res) => {
        const indexPath = path.join(__dirname, 'index.html');
        const readStream = fs.createReadStream(indexPath);

        readStream.pipe(res);
    }));

const io = socket(server);
io.on('connection', client => {
    console.log(client.id);
    // console.log('new connection');
    client.on('client-msg', data => {
        // console.log(data);
        // const payload = {
        //     message: data.message.split('').reverse().join(''),
        // };
        console.log('Сообщение: ', data.message);
        const payload = {
            message: `${client.userName}: ${data.message}`,
        };

        client.broadcast.emit('server-msg', payload);
        client.emit('server-msg', payload);
    });
    client.on('new-client', data => {
        client.userName = data.userName;
        client.broadcast.emit('server-msg', {message: `${data.userName} connected`})
    })
    client.on('disconnect', data => {
        client.broadcast.emit('server-msg', {message: `${client.userName} disconnected`})
    })
});

server.listen(3000);
