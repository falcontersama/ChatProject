var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var servermsg ={'default' : []};
var serverroom =['default'];
var port = process.argv.slice(2);
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.roomname = 'default';
    socket.clientmsg={};
    socket.clientmsg[socket.roomname] = servermsg[socket.roomname].slice(0);
    socket.username = socket.id;
    socket.break ={'default': false};
    socket.join(socket.roomname);
    io.to(socket.id).emit('update chat', socket.clientmsg[socket.roomname]);
    for (i=0;i<serverroom.length;i++){
        io.to(socket.id).emit('update room', serverroom[i]);
    }

    socket.on('join',(newroom)=>{
        socket.join(newroom);
        socket.roomname = newroom;
        if (servermsg[socket.roomname]==undefined){
            servermsg[socket.roomname] = [];
        }
        console.log(socket.break[socket.roomname])
        if (!socket.break[socket.roomname]){
            socket.break[socket.roomname] = false;
            socket.clientmsg[socket.roomname] = servermsg[socket.roomname].slice(0);
        }
        io.to(socket.id).emit('update chat',socket.clientmsg[socket.roomname]);
    });

    socket.on('set username',(name)=>{
        socket.username = name;
    });

    socket.on('add room',(room)=>{
        serverroom.push(room);
        io.emit('update room',serverroom[serverroom.length-1]);
    });

    socket.on('break room',(room)=>{
        socket.break[room] = !socket.break[room];
        if (!socket.break[room]){
            socket.clientmsg[room] = servermsg[room].slice(0);
            if(room = socket.roomname){
                io.to(socket.id).emit('update chat', socket.clientmsg[room]);
            } 
        } 
    });

    socket.on('chat message', function(msg){
        var d = new Date();
        servermsg[socket.roomname].push({id: servermsg[socket.roomname].length +1, user : socket.username , message: msg , time: d.getHours()+ " : " + d.getMinutes() + " : "+ d.getSeconds()});
        for (cid in io.sockets.sockets){
            csocket = io.sockets.sockets[cid]
            if(!csocket.break[socket.roomname] && csocket.rooms[socket.roomname]){
                csocket.clientmsg[socket.roomname].push({id: servermsg[socket.roomname].length +1, user : socket.username , message: msg , time: d.getHours()+ " : " + d.getMinutes() + " : "+ d.getSeconds()})
                io.to(csocket.id).emit('update chat',csocket.clientmsg[socket.roomname]);
            }
        }
    });
		var destination = 'localhost:3001';
		//socket.emit('redirect', destination);
  });

http.listen(Number(port), function(){
    console.log('started on port '+port);
});
