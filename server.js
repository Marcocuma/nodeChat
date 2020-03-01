var siofu = require("socketio-file-upload");
var port = process.env.PORT || 8080;
var express = require('express')
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(siofu.router);
app.use(express.static(__dirname + '/public'))
var conectados = 0;
var listaUsers = [{msg:"Chat general",id:"general",img:"perfil/s1.jpg"}]; 

function compruebaClientes(users){
  let idClientes = Object.keys(io.sockets.sockets)
  console.log(idClientes)
  listaUsers = listaUsers.filter(element => {
    console.log(element)
    console.log()
    if (idClientes.includes(element.id)||element.id == "general"){
      console.log("true")
      return element
    }
  })
  console.log(listaUsers)
}
function cambiarDatosCliente(datos){
  let modificado = false
  listaUsers.forEach((valor,indice) => {
    console.log(valor.id)
    if(valor.id == datos.id){
      modificado = true
      listaUsers[indice].msg = datos.msg
      listaUsers[indice].img = datos.img
    }
  })
  if(!modificado)
    listaUsers.push({msg:datos.msg,id:datos.id,img:datos.img})
}
io.on('connection', function(socket){
    console.log('a user connectedede');
    conectados++
    var uploader = new siofu();
    socket.on('create', function(room) {
      socket.join(room);
    });
    uploader.dir = "./public/archivos";
    uploader.listen(socket);
    uploader.on('complete',function(event){
      console.log(event['file']['pathName'].substr(7))
      io.sockets.in(event['file']['meta']['room']).emit('fotoSubida',{arch:event['file']['pathName'].substr(7),id:event['file']['meta']['id'],usr:event['file']['meta']['usr'],room:event['file']['meta']['room'],name:event['file']['name']})
    })
    socket.on('username',function(msg){
      cambiarDatosCliente(msg)
      console.log(msg)
      io.emit('listaUsers',listaUsers)
    })
    socket.on('disconnect', function(){
        console.log('user disconnected');
        conectados--
        io.emit('usuarios',conectados)
        compruebaClientes(Object.keys(io.sockets.sockets));
        io.emit('listaUsers',listaUsers)
    });
    socket.on('chat message', function(msg){
        io.sockets.emit('chat message', {mensaje:msg.msg, usr:msg.usr, id:msg.id, room:msg.room});
        console.log('message: ' + msg.room);
    });
    io.emit('usuarios',conectados)
    socket.on('escribiendo', function(msg){
      if(msg != '')
        socket.broadcast.emit('escribiendoCliente',{usr:msg.usr,room:msg.room})
    })
});

http.listen(port, function(){
  console.log('listening on '+port);
});
