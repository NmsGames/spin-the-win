const SendSocketToFunTimer = require("./FunTargetTimer").GetSocket;
const SendSocketToAmericanRoulette = require("./AmericanRouletteTimer").GetSocket;



function sendSocket(socket){
    SendSocketToFunTimer(socket)
    //SendSocketToAmericanRoulette(socket)
}

module.exports.sendSocket = sendSocket;