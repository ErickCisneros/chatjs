const http = require('http');
const path = require('path');

const express = require('express');
const socketio = require('socket.io');

const mongoose = require('mongoose');

const app = express(); //Este es el servidor
const server = http.createServer(app);
const io = socketio.listen(server);

mongoose.connect('mongodb://localhost/chat')
//mongoose.connect('mongodb+srv://erick:erick@chat-database-kjcnu.mongodb.net/test?retryWrites=true&w=majority')
.then(db => console.log('db is connected'))
.catch(err => console.log(err));

//Settings
app.set('port', process.env.PORT || 3000);

require('./sockets')(io);

//Static files
app.use(express.static(path.join(__dirname, 'public')));

//Start the server
server.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});