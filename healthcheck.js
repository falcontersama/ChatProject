var express = require('express');
var app = express();
var healthChecker = require('http').Server(app);
var http = require('http');
var io = require('socket.io')(healthChecker);
var port = process.argv.slice(2);   //specify port on command line
if(port==''){
	port = 3000;    //set default port for healthchecker
}
var server1Port = 3001; //set default port for main server
var server2Port = 3002; //set default port for second server
var pingInterval = 500;    //ms
var available;
var destinationPort;
var cors = require('cors');
app.use(cors());

app.use(express.static('public'));

function testMainServerConnection(){
    var options = {
        host: 'localhost',
        port: server1Port,
    };
    //ping using http get
    let request = http.get(options, function(res) {
        //console.log('STATUS: ' + res.statusCode);
        available = true;
    });
    request.on('error', function(e) {
        //console.log(e.name);
        available = false; 
    });
    //wait for one second after ping and then check if the server is available
    setTimeout(() => {
        //if server main is unavailable healthchecker will return second server port to client
        if(available){
            console.log("success ping to port "+server1Port);   
            destinationPort = server1Port;  
        } else{
            console.log("failed ping to port "+server2Port);
            destinationPort = server2Port;
        }
        console.log("healthchecker will return port: "+destinationPort+" to client");
    }, 1000);
};

//check server 1 status every given interval
var id = setInterval(testMainServerConnection, pingInterval);

app.get('/api', function(req, res){
    //what to send to client when they connect to healthchecker
    //here client will receive destination url they have to connect to
    testMainServerConnection();
    console.log('return : ',destinationPort);
    
    res.send({'destination' : 'http://localhost:'+destinationPort});
});

io.on('connection', function(socket){
    console.log(socket.id + ' joins the healthchecker');
});

healthChecker.listen(Number(port), function(){
    console.log('started healthchecker on port '+port);
});