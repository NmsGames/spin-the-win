"use strict";
const debug = require("debug")("test");
const commontVar = require("../Constants").commonVar;
const selectGame = require("../Constants").SelectGame;

async function JoinRoom(data) {
 return(new Promise(function (myResolve, myReject) {
   let roomName=selectGame[data.gameId];
    data.socket.join(roomName, () => {
      debug(`user ${data.socket.id} joined room ${roomName } `);
    });
    myResolve({result:"success",roomName:roomName});
  }));
 
}


module.exports.JoinRoom = JoinRoom;