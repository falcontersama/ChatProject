# Chat Application

## Health Checker
Healthchecker will ping main server at specified port ( default is http://localhost:3001/ ) every 3 seconds.
```js
setInterval(testMainServerConnection, pingInterval);
```
If ping successes, it will return main server url to client.
If ping fails, it will return secondary server url to client (assumed that second server never fails).
```js
if(available){
    console.log("success ping to port "+server1Port);   
    destinationPort = server1Port;  
} else{
    console.log("failed ping to port "+server2Port);
    destinationPort = server2Port;
}
```
```js
app.get('/', function(req, res){
    //what to send to client when they connect to healthchecker
    //here client will receive destination url they have to connect to
    res.send({'destination' : 'http://localhost:'+destinationPort});
});
```
Client should use the received url to connect with real chat server.
Note that when starting a chat server, please use 3001 and 3002, or edit the following lines in healthcheck.js to your desired port.
```js
var server1Port = 3001; //set default port for main server
var server2Port = 3002; //set default port for second server
```
