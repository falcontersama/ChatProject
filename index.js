var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    var roomname = 'default';
    socket.join(roomname);
    socket.leave(socket.id);
    socket.on('join',function(newroom){
        socket.leave(roomname)
        socket.join(newroom);
        roomname = newroom;
    })
    socket.on('chat message', function(msg){
        io.to(roomname).emit('chat message', msg);
        console.log(socket.id +' emit '+msg + ' to '+roomname);
    });
  });

http.listen(3000, function(){
    console.log('listening on *:3000');
});
    