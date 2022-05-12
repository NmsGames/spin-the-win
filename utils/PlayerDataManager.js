const debug = require("debug")("test");
let Players=[]

function AddPlayer(data){
    let player =  Players.filter(player => player.socketId === data.socketId);
    if(player.length === 0){
      Players.push(data)
      debug("new player add");
    }
    return true;
}
function RemovePlayer(socketId){

  for (let i = 0; i < Players.length; i++) {
   if(Players[i].socketId===socketId){
     debug(Players[i].playerId +"player removed")
    Players.splice(i,1);
    return;
   }
   debug("player not found");
  }
}
function GetPlayerData(socketId){
  for (let i = 0; i < Players.length; i++) {
    if(Players[i].socketId===socketId){
      return Players[i];
    }    
  }
  return null;
}

function GetPlayerById(playerId){
  let player =  Players.filter(player => player.playerId === playerId);
  return player
}


  module.exports.AddPlayer=AddPlayer;
  module.exports.RemovePlayer=RemovePlayer;
  module.exports.GetPlayerData=GetPlayerData;
  module.exports.GetPlayerById=GetPlayerById;