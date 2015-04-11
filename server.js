var users = [];
var buffer = [];

var port=process.env.OPENSHIFT_NODEJS_PORT;
var ipaddress=process.env.OPENSHIFT_NODEJS_IP;
//var port=9091;
//var ipaddress="127.0.0.1";
console.log(port);
console.log(ipaddress);
///////////////////////////////////////////////////////////////
var app = require('http').createServer(handler);
app.listen(port,ipaddress);
var  io = require('socket.io').listen(app);
var  fs = require('fs');
var Moniker = require('moniker');
///////////////////////////////////////////////////////////////
function handler (req, res) {
  //fs.readFile(__dirname + 'index.html',
  fs.readFile('index.html',
    
 function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(data);
  });
}
////////////////////////////////////////////////////////////
var x=10;
var y=20;

//io.configure('development', function(){
      //io.set("transports", ["websocket"]);
//      io.set("transports", ["websocket","xhr-polling"]);
      //io.set("polling duration", 30);
      //io.set("close timeout", 10); 
      // socket.set("log level", 3);
      //io.set("log level", 1);
//});

io.sockets.on('connection', function (socket) {
    if(x>=520){x=10;y=20;}
	var user = addUser(x,y);
	x+=50;
	y+=10;
	console.log("CREATE USER"+JSON.stringify(user));
	
   socket.on("disconnect", function() {
    	   removeUser(user);
    	   console.log("REMOVE USER"+JSON.stringify(user));
    	   io.sockets.emit("onRemoveUser",JSON.stringify(user));
		    ///////////////////////////////////////CHAT
    		  var mensaje={name:user.name,message:"desconectado"};
    		  controlarBuffer(mensaje);
    		  io.sockets.emit("onRemoveChatUser",JSON.stringify(mensaje));
    });

    socket.on("onChangePositionUser", function(data) {
    	
    	var user=JSON.parse(data);

	   	for(var i=0; i<users.length; i++) {
	    	if(user.name === users[i].name) {
	    		users[i].x=user.x;
	    		users[i].y=user.y;
	    		break;
    		}
    	}
    	io.sockets.emit("onChangeAllPositionUsers",JSON.stringify(users));
    	 
    });	
   
    ////////////////////////////CHAT////////////////////////////////////////
    socket.emit("onBeginPositionUser",JSON.stringify(user),function(data){
        io.sockets.emit("onChangeAllPositionUsers",JSON.stringify(users));
          
   });
    
  var mensaje={name:user.name,message:"conectado"}
  controlarBuffer(mensaje);
  obj={};obj.user=user;obj.users=users;obj.buffer=buffer;
  socket.emit("onBeginChatSelf",JSON.stringify(obj));         
  socket.broadcast.emit("onBeginChatOther",JSON.stringify(mensaje));
   //mensaje enviado del cliente al servidor
   socket.on("onSendMessageChatUser", function(data) {
                  
                  var message=JSON.parse(data);//data.name,data.message
                  controlarBuffer(message);//llenamos el buffer      
                  socket.broadcast.emit("onCatchMesageChatUsers",JSON.stringify(message));//solo envia un mensaje
            });
});
/////////////////////////////////////////////////////////////////////////////////////////////
   
    var addUser = function(x,y) {
    	var user = {};
    	user.name=Moniker.choose();
    	user.x=x;
    	user.y=y;
	user.message="";	
	//user.port=port;
	//user.ipaddress=ipaddress;
    	users.push(user);
    
    	return user;
    }//end function
    var removeUser = function(user) {
    	for(var i=0; i<users.length; i++) {
	    	if(user.name === users[i].name) {
	    		users.splice(i, 1);
	    
	    	return;
    		}
    	}
    }//end function
    var controlarBuffer=function(dataBuffer){
          //Buffer modificar!!!!!!!!!!!!!!!!
         if(buffer.length>6){
           buffer.splice(0, 1);
           buffer.push(dataBuffer);
         }
         else
          buffer.push(dataBuffer);
   }//end function
