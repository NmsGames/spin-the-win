"use strict"
const JoinRoom = require("./JoinRoom").JoinRoom;
const debug = require("debug")("test");
const commonVar = require("../Constants").commonVar;
const selectGame = require("../Constants").SelectGame;
const StartAmericanRouletteGame = require("../gameplay/AmericanRouletteTimer").StartAmericanRouletteGame;  
const StartFunTrGame = require("../gameplay/FunTargetTimer").StartFunTrGame; 


async function MatchPlayer(data) {

    let result = await JoinRoom(data);
    if (result.result === commonVar.success) {
        debug("successfully Match the room " + result[commonVar.roomName]);
        data[commonVar.roomName] = result[commonVar.roomName];
    }

    switch (data[commonVar.roomName]) {
    	case selectGame[1]:  /*StartAmericanRouletteGame(data);*/ break;
        case selectGame[3]:  StartFunTrGame(data); break;
        default : break;
    }
}

module.exports.MatchPlayer = MatchPlayer;