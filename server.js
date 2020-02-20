var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var conectados = 0;
var listaUsers = []; 

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    conectados++
    socket.on('username',function(msg){
      
    })
    socket.on('disconnect', function(){
        console.log('user disconnected');
        conectados--
        io.emit('usuarios',conectados)
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', {mensaje:msg.msg, autor:msg.autor});
        console.log('message: ' + msg);
    });
    io.emit('usuarios',conectados)
    socket.on('escribiendo', function(msg){
      if(msg != '')
        socket.broadcast.emit('escribiendoCliente',msg)
    })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
