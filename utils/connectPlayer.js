const debug = require("debug")("test");
const service = require("../services/AppService");
let livePlayers=[];

function getPlayer(){
   return livePlayers;
}

function registeToLobby(data){
  let status = 1;
  livePlayers.push(data);
  service.changeStatus(status,data.playerId);
  debug("player ID "+data.playerId+" enter in lobby");
}

function exitToLobby(socketId){
  let status = 0;
  for (let i = 0; i < livePlayers.length; i++) {
    if(livePlayers[i].socketId===socketId){
      service.changeStatus(status,livePlayers[i].playerId);
      debug("player ID " +livePlayers[i].playerId+" leave from lobby");
      livePlayers.splice(i,1);
      return;
    }
    debug("player not found");
  }
}


module.exports = {getPlayer,registeToLobby,exitToLobby};