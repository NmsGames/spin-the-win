// "use strict";
const express = require('express');
 
const app = express();
const http = require("http").createServer(app);
const port = process.env.PORT || 4500
const io = require("socket.io")(http);
 //IMport 
const {userLogin,forceLogin,userSignUp,userProfile} = require("./services/UserLogin");
const events = require("./Constants").events;
const commonVar = require("./Constants").commonVar;
const MatchMaking = require("./utils/MatchMaking").MatchPlayer;
const playerManager  = require('./utils/PlayerDataManager');

const debug = require("debug")("test");
// add headers
// app.use(function (req,res,next) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
//     next();
// });
const webservice = require("./services/WebServices");
// require("./ServerSocket.js").createSocket(io);

 //Socket Function
 
io.on("connection", (socket) => {  
    DissConnect(socket);
    UserLogin(socket);
    UserSignUp(socket);
    RegisterToGameRoom(socket)
    ForceLogin(socket)
  UserProfile(socket)
})


function DissConnect(socket) {
    socket.on("disconnect", () => {
        debug("player got dissconnected " + socket.id);
          playerManager.RemovePlayer(socket.id);
    })
}

function UserProfile(socket){
  socket.on(events.OnUserProfile, async(data) =>{
    let result = await userProfile(data);
      socket.emit(events.OnUserProfile,result);
    })
}
function UserSignUp(socket){
  socket.on(events.OnSignUp, async(data) =>{
    let result = await userSignUp(data); 
          socket.emit(events.OnSignUp,result);
    })
}
function UserLogin(socket){
  socket.on(events.OnLogin, async(data) =>{
    let result = await userLogin(data);
    if(result.status === 200) addPlayerToRoom(result.data,socket);
          socket.emit(events.OnLogin,result);
    })
}



function ForceLogin(socket){
  socket.on(events.OnForceLogin, async(data) =>{
    let removePlayer = await forceRemovePlayer(data.user_id);
    let result = await forceLogin(data);
      if(result.status === 200) addPlayerToRoom(result.data,socket);
          socket.emit(events.OnLogin,result);
    })
}

function forceRemovePlayer(playerId){
      let player = playerManager.GetPlayerById(playerId);
      if(player && player.length>0){
        let socket    =  player[0].socket;
        socket.emit(events.OnForceExit);
        playerManager.RemovePlayer(socket.id);
        socket.disconnect();
    }    
      return true;
}


function addPlayerToRoom(data,socket){
    let obj = {
      socket  : socket,
        socketId: socket.id,
        playerId: data.user_id,
        balance : data.coins,
    }
    playerManager.AddPlayer(obj);
    return;
}


function RegisterToGameRoom(socket) {
    socket.on(events.RegisterPlayer,(data) => {
      let playerObj = {
        socket: socket,
        playerId: data[commonVar.playerId],
        gameId: data[commonVar.gameId],
      };
      MatchMaking(playerObj)
    })
  }
/**END FUNCTION */

//const PORT = process.env.PORT || 5000;
require("./gameplay").sendSocket(io.sockets);
const path = require("path");


app.use('/',webservice);
app.use(express.static('public'))

app.get("/", (req, res) => {
  res.send('default routes!');
});

app.get("/servertesting", (req, res) => {
  res.sendFile(path.join(__dirname + '/public/test.html'));
});


http.listen(port, () => {
  debug("listening on " + port);
});