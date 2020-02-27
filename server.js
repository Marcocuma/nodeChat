var siofu = require("socketio-file-upload");
var express = require('express')
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(siofu.router);
app.use(express.static(__dirname + '/public'))
var conectados = 0;
var listaUsers = []; 


io.on('connection', function(socket){
    console.log('a user connected');
    conectados++
    var uploader = new siofu();
    uploader.dir = "./public/archivos";
    uploader.listen(socket);
    uploader.on('complete',function(event){
      console.log(event)
    })
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
