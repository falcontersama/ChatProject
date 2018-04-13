var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var servermsg ={'default' : ['hi','hihi']};

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    var roomname = 'default';
    var clientmsg ={"default":[]};
    socket.join(roomname);
    io.to(socket.id).emit('update', servermsg[roomname]);
    socket.on('join',function(newroom){
        socket.join(newroom);
        roomname = newroom;
        if (servermsg[roomname]==undefined){
            servermsg[roomname] = [];
        }
        clientmsg[roomname] = servermsg.roomname;
        io.to(socket.id).emit('update',servermsg.roomname);
    })
    socket.on('chat message', function(msg){
        servermsg[roomname].push(msg);
        io.to(roomname).emit('update', servermsg[roomname]);
    });
  });

http.listen(3000, function(){
    console.log('started');
});
    