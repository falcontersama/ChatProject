var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var servermsg ={'default' : []};
var serverroom =['default'];
var port = process.argv.slice(2);
app.use(express.static('public'));
var cors = require('cors');
app.use(cors());

let anotherserver;
http.listen(Number(port), function(){
    console.log('started on port ' + port);
});
if (port == 3001){
    anotherserver = 3002;
}else{
    anotherserver = 3001;
}

console.log('connect to',anotherserver);

let socketserver = require('socket.io-client')('http://localhost:'+anotherserver);
socketserver.on('connect', ()=>{
    console.log('created' , port);
});


io.on('connection', function(socket){
    socket.join('default');
    io.to(socket.id).emit('server room',(serverroom));

    socket.on('update server',(msgserver,roomserver)=>{
        console.log('server update to '+ anotherserver);
        servermsg = msgserver;
        serverroom = roomserver;
    });

    socket.on('init room',(room)=>{
        for (i=0;i<room.length;i++){
            socket.join(room[i]);
        }
    })

    socket.on('join',(newroom)=>{
        socket.join(newroom);
        if (servermsg[newroom] === undefined){
            servermsg[newroom] = [];
        }
        socketserver.emit('update server',servermsg,serverroom);
    });

    socket.on('get msgcheckpoint',(room)=>{
        console.log('get msgcheckpoint')
        io.to(socket.id).emit('msgcheckpoint',room,servermsg[room].length);
    });

    socket.on('get breakmsg',(room,chkpoint)=>{
        if(chkpoint === -1){
            chkpoint =0;
        }
        socket.emit('breakmsg',room,servermsg[room].slice(chkpoint));
    })

    socket.on('add room',(room)=>{
		console.log("add room ",room);
        serverroom.push(room);
        for (cid in io.sockets.sockets){
            io.to(cid).emit('server room',serverroom);
        }
        socketserver.emit('update server',servermsg,serverroom);
    });


    socket.on('chat message', (msg,room,username)=>{
        console.log(socket.id + ' send ' + msg);
        let d = new Date();
        servermsg[room].push({
             id: servermsg[room].length,
             user : username ,
             message: msg ,
             time: d.getHours()+ ":" + d.getMinutes() + ":"+ d.getSeconds()});
        socketserver.emit('update server',servermsg,serverroom);
        for (cid in io.sockets.sockets){
            io.to(cid).emit('addchat',servermsg[room][servermsg[room].length-1],room);
        }
    });

    socket.on('leave',(room)=>{
        socket.leave(room);
    });
  });


