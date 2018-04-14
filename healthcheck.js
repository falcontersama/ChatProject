var app = require('express')();
var http = require('http').Server(app);
var httpS1 = require('http').Server(app);
var httpS2 = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.argv.slice(2);
var destination = 'http://localhost:3001/';
if(port==''){
	port = 3000;
}
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
		console.log(socket.id + 'joins the server');
		
		io.emit('redirect', destination);
  });

http.listen(Number(port), 'localhost', function(){
    console.log('started on port '+port);
});
httpS1.listen(3001, 'localhost', function(){
    console.log('started on port '+3001);
});
httpS2.listen(3002, 'localhost', function(){
    console.log('started on port '+3002);
});

