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

var currentroom = {};
var joinedroom = {};
var clientmsg ={};
var msgcheckpoint = {};
var username ={};
var breakstatus = {};

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
    socketserver.emit('update server',servermsg,serverroom);
});


io.on('connection', function(socket){
    currentroom[socket.id] = 'default';
    joinedroom[socket.id] ={};
    joinedroom[socket.id][currentroom[socket.id]] = 1;
    clientmsg[socket.id]={};
    clientmsg[socket.id][currentroom[socket.id]] = [];
    msgcheckpoint[socket.id] ={};
    msgcheckpoint[socket.id][currentroom[socket.id]] = servermsg[currentroom[socket.id]].length-1;
    username[socket.id] = socket.id;
    console.log(username[socket.id] + ' joins the server');
    breakstatus[socket.id] ={'default': false};
    socket.join(currentroom[socket.id]);
    io.to(socket.id).emit('update chat', clientmsg[socket.id][currentroom[socket.id]]);
    io.to(socket.id).emit('update room', serverroom,currentroom[socket.id],breakstatus[socket.id]);
    setTimeout(() => {
        io.to(socket.id).emit('id',socket.id);
    }, 1000);

    socket.on('update server',(msgserver,roomserver)=>{
        console.log('server update to '+ anotherserver);
        servermsg = msgserver;
        serverroom = roomserver;
    });

    socket.on('get from id',(id)=>{
        console.log(id);
        for (r in joinedroom[socket.id]){
            socket.leave(r);
        }
        currentroom[socket.id] = currentroom[id];
        joinedroom[socket.id] = joinedroom[id];
        clientmsg[socket.id] = clientmsg[id];
        msgcheckpoint[socket.id] = msgcheckpoint[id];
        username[socket.id] = username[id];
        breakstatus[socket.id] = breakstatus[id];
        delete currentroom[id];
        delete joinedroom[id];
        delete clientmsg[id];
        delete msgcheckpoint[id];
        delete username[id];
        delete breakstatus[id];
        for (r in joinedroom[socket.id]){
            socket.join(r);
        }
        setTimeout(() => {
            //console.log(clientmsg[socket.id]);
            //console.log(clientmsg[socket.id][currentroom[socket.id]]);
            io.to(socket.id).emit('update chat', clientmsg[socket.id][currentroom[socket.id]]);
            io.to(socket.id).emit('update room', serverroom,currentroom[socket.id],breakstatus[socket.id]);
        }, 1000);
    })

    socket.on('join',(newroom)=>{
        socket.join(newroom);
        currentroom[socket.id] = newroom;
        joinedroom[socket.id][currentroom[socket.id]] = 1;
        if (servermsg[currentroom[socket.id]] === undefined){
            servermsg[currentroom[socket.id]] = [];
        }
        if(msgcheckpoint[socket.id][currentroom[socket.id]] === undefined){
            msgcheckpoint[socket.id][currentroom[socket.id]] = servermsg[currentroom[socket.id]].length-1;
        }
        if (!breakstatus[socket.id][currentroom[socket.id]]){
            breakstatus[socket.id][currentroom[socket.id]] = false;
            clientmsg[socket.id][currentroom[socket.id]] = [];
            for(i=0; i<servermsg[currentroom[socket.id]].length;i++){
                let m = servermsg[currentroom[socket.id]][i];
                if(m.id>msgcheckpoint[socket.id][currentroom[socket.id]]){
                    clientmsg[socket.id][currentroom[socket.id]].push(m);
                }
            }
        }
        io.to(socket.id).emit('update chat',clientmsg[socket.id][currentroom[socket.id]]);
        io.to(socket.id).emit('update room', serverroom,currentroom[socket.id],breakstatus[socket.id]);
        socketserver.emit('update server',servermsg,serverroom);
    });

    socket.on('set username',(name)=>{
		console.log("set username");
        username[socket.id] = name;
    });

    socket.on('add room',(room)=>{
		console.log("add room");
        serverroom.push(room);
        for (cid in io.sockets.sockets){
            io.to(cid).emit('update room',serverroom,currentroom[cid],breakstatus[cid]);
        }
        socketserver.emit('update server',servermsg,serverroom);
    });

    socket.on('break room',(room)=>{
        breakstatus[socket.id][room] = !breakstatus[socket.id][room];
        if (!breakstatus[socket.id][room]){
            clientmsg[socket.id][room] = [];
            for(m in servermsg[room]){
                if(m.id>msgcheckpoint[socket.id][room]){
                    clientmsg[socket.id][room].push(m);
                }
            }
            if(room === currentroom[socket.id]){
                io.to(socket.id).emit('update chat', clientmsg[socket.id][room]);
            } 
        }
        io.to(socket.id).emit('update chat',clientmsg[socket.id][currentroom[socket.id]]); 
    });

    socket.on('chat message', (msg)=>{
        console.log(socket.id + ' send ' + msg);
        let d = new Date();
        servermsg[currentroom[socket.id]].push({
             id: servermsg[currentroom[socket.id]].length,
             user : username[socket.id] ,
             message: msg ,
             time: d.getHours()+ ":" + d.getMinutes() + ":"+ d.getSeconds()});
        socketserver.emit('update server',servermsg,serverroom);
        for (cid in io.sockets.sockets){
            if(!breakstatus[cid][currentroom[socket.id]] && joinedroom[cid][currentroom[socket.id]]){
                clientmsg[cid][currentroom[socket.id]].push({
                    id: servermsg[currentroom[socket.id]].length,
                    user : username[socket.id] ,
                    message: msg ,
                    time: d.getHours()+ ":" + d.getMinutes() + ":"+ d.getSeconds()})
                if(currentroom[cid] === currentroom[socket.id]){
                    io.to(cid).emit('update chat',clientmsg[cid][currentroom[socket.id]]);
                }
            }
        }
    });

    socket.on('leave',(room)=>{
        delete clientmsg[socket.id][room];
        delete msgcheckpoint[socket.id][room];
        delete joinedroom[socket.id][room];
        socket.leave(room);
    });
  });


