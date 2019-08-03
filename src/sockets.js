const Chat = require('./models/Chat')

module.exports = function(io) {

    let users = {};

    //IO contiene todos los datos
    io.on('connection', async socket => {
        console.log('new user connected');

        let messages = await Chat.find({}).limit(10);

        socket.emit('load old msgs', messages);

        socket.on('new user', (data, cb) => {
            if(data in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            }
        });

        socket.on('send message', async (data, cb) => {
            var msg = data.trim()
            if(msg.substr(0,3) === '/w ') {
                msg = msg.substr(3);
                const index = msg.indexOf(' ');
                if(index !== -1 ) { //Si existe un mensaje para enviar
                    var name = msg.substr(0, index);
                    var msg = msg.substr(index+1);
                    if(name in users) {
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    } else {
                        cb('Error! Ingresa un usuario válido');
                    }
                } else {
                    cb('Error! Ingresa un mensaje');
                }
            } else {
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickname
                });
                await newMsg.save();
                io.sockets.emit('new message', {
                    msg: data,
                    nick: socket.nickname
                });
            }
        });

        socket.on('disconnect', data => {
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
        });

        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }

    });
}