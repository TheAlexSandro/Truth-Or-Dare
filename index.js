const { bot } = require('./callback.js')
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const variable = require('./variable.js')

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

bot.launch()
bot.telegram.sendMessage(variable.adminBot, `<b>Server menyala!</b>\nSemua proses telah dibatalkan.`, { parse_mode: 'HTML' })

const port = process.env.PORT || 4000;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
