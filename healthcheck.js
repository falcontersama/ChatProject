var app = require('express')();
var server = require('http').Server(app);
var http = require('http');
var io = require('socket.io')(http);
var port = process.argv.slice(2);
var destination = 'http://localhost:3001/';
var destination2 = 'http://localhost:3002/';

function isAvailable(testPort){
    var options = {
        host: 'localhost',
        port: testPort,
    };
    var request = http.get(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        req = true;

    });
    request.on('error', function(e) {
        req = false;
    });
    
};
var req;
isAvailable(3001);
var req2;
isAvailable(3002);

setTimeout(() => {
    if (req){
        console.log("successful connection to 3001");
    } else {
        console.log("port 3001 unavailable");
        if(req2){
            console.log("successful connection to 3002");
        }else {
            console.log("port 3002 unavailable");
        }
    }
}, 1000);


if(port==''){
	port = 3000;
}
app.get('/', function(req, res){
    res.send(destination);
});

io.on('connection', function(socket){
		console.log(socket.id + 'joins the server');
		
		//io.emit('redirect', destination);
  });

server.listen(Number(port), 'localhost', function(){
    console.log('started on port '+port);
});
// httpS1.listen(3001, 'localhost', function(){
    // console.log('started on port '+3001);
// });
// httpS2.listen(3002, 'localhost', function(){
    // console.log('started on port '+3002);
// });

