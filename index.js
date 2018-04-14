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
		console.log(socket.id + 'joins the server');
    socket.roomname = 'default';
    socket.clientmsg = {"default":[]};
    socket.username = socket.id;
    socket.join(socket.roomname);
    io.to(socket.id).emit('update chat', servermsg[socket.roomname]);
    io.to(socket.id).emit('update room', serverroom);
    socket.on('join',(newroom)=>{
        socket.join(newroom);
        socket.roomname = newroom;
        if (servermsg[socket.roomname]==undefined){
            servermsg[socket.roomname] = [];
        }
        socket.clientmsg[socket.roomname] = servermsg[socket.roomname];
        io.to(socket.id).emit('update chat',servermsg[socket.roomname]);
    }) 

    socket.on('set username',(name)=>{
        socket.username = name;
    })

    socket.on('add room',(room)=>{
        serverroom.push(room);
        io.emit('update room',serverroom);
    })

    socket.on('chat message', function(msg){
        var d = new Date();
        servermsg[socket.roomname].push({id: servermsg[socket.roomname].length +1, user : socket.username , message: msg , time: d.getHours()+ " : " + d.getMinutes() + " : "+ d.getSeconds()});
        //for (id in io.sockets){
            
        //}
        io.to(socket.roomname).emit('update chat', servermsg[socket.roomname]);
    });
		var destination = 'localhost:3001';
		socket.emit('redirect', destination);
  });

http.listen(Number(port), function(){
    console.log('started on port '+port);
});
