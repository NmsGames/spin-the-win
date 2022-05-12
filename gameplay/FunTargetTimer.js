"use strict"
const debug = require("debug")("test");
const events = require("../Constants").events;
const commonVar = require("../Constants").commonVar;
const timerVar = require("../Constants").timerVar;
const state = require("../Constants").state;
const gameId   = 3;
const gameRoom = require("../Constants").SelectGame[gameId];
const {PreviousWinData,getUserPoints,JoinGame,setRoundCount,calcWinningNo,calcWinningAmount,AddWinAmt,PendingWinAmount,PreviousRoundBet} = require("../services/FunTargetGameService");
const playerManager   = require('../utils/PlayerDataManager');


let Sockets;
let gameState;
let RoundCount;
let timer = timerVar.bettingTimer;



let previousWinData = new Array(10);



function GetSocket(SOCKET) {
    Sockets = SOCKET;
    ResetTimers(); 
}

function StartFunTargetTimerGame(data){
	SendCurrentRoundInfo(data);
	OnSendTimer(data)
	OnSendUserInfo(data)
	OnPreRoundBet(data)
	OnPlaceBet(data);
	AddLastRoundAmt(data);
	OnleaveGameRoom(data);
}

function OnleaveGameRoom(data){
	let socket = data[commonVar.socket];
	socket.on(events.onleaveRoom,function(data){  
	    try{
		    socket.leave(gameRoom);
		    socket.removeAllListeners(events.OnTimer);
		    socket.removeAllListeners(events.OnUserInfo);
		    socket.removeAllListeners(events.OnPlaceBet);
            socket.removeAllListeners(commonVar.test);
            socket.removeAllListeners(events.onleaveRoom);
            socket.removeAllListeners(events.OnTakeAmount);
            socket.emit(events.onleaveRoom,{success:`successfully leave ${gameRoom} game.`});
	    }catch(err){
	        debug(err);
	    }
	})
}



async function SendCurrentRoundInfo(data) {
    let socket = data[commonVar.socket];
    let player = playerManager.GetPlayerData(socket.id);
    let previousWinData = await PreviousWinData(RoundCount);
    let pendingWinningData = await PendingWinAmount(player.playerId);
    let obj = {
    	balance : player.balance,
        gametimer:timer,
        RoundCount:RoundCount,
        previousWinData:previousWinData,
        pendingWinningData:pendingWinningData
    }
    socket.emit(events.OnCurrentTimer, obj)
}



function OnSendTimer(data){
	let socket = data[commonVar.socket];
	socket.on(events.OnTimer, async (data) => {
		let result = (timer) ? timer : 0   
    	socket.emit(events.OnTimer, {result});
    })
}


function OnSendUserInfo(data){
	let socket = data[commonVar.socket];
	socket.on(events.OnUserInfo, () => {
		SendCurrentRoundInfo(data)
    })
}


function OnPreRoundBet(data){
	let socket = data[commonVar.socket];
	socket.on(events.OnPreBet, async(data) => {
		let result = await PreviousRoundBet(data);  
		socket.emit(events.OnPreBet, result)
    })
}





function OnPlaceBet(data) {
	let socket = data[commonVar.socket];
    socket.on(events.OnPlaceBet, async(data) => {
    	let result = await JoinGame(data,RoundCount,gameState);  //db 
    	Sockets.to(gameRoom).emit(events.OnPlaceBet, result);
    });
}



// async function sendWinningNo() {
// 	let winArr = await calcWinningNo(RoundCount);
// 	Sockets.to(gameRoom).emit(events.OnWinNo,winArr);
// 	let PlayerWinBets = await calcWinningAmount(RoundCount);
// 	if(PlayerWinBets && PlayerWinBets.length > 0) {
// 		for (let bets of PlayerWinBets ) {
// 			let player = playerManager.GetPlayerById(bets.playerId);
// 			let socket    =  player[0].socket;
// 			socket.emit(events.OnWinAmount,bets);
// 		}
// 	}
// 	return true;
// }

async function sendWinningNo() {
	let winArr = await calcWinningNo(RoundCount);
	Sockets.to(gameRoom).emit(events.OnWinNo,winArr);
	let PlayerWinBets = await calcWinningAmount(RoundCount);
	if(PlayerWinBets.length > 0) {
        if(timer >= 0 && timer <= 6) await sleep(timer*1000+3000)
		for (let bets of PlayerWinBets ) {
			let player = playerManager.GetPlayerById(bets.playerId);
			let socket    =  player[0].socket;
			socket.emit(events.OnWinAmount,bets);
		}
	}
	return true;
}



function AddLastRoundAmt(data){
	let socket = data[commonVar.socket];
    socket.on(events.OnTakeAmount, async(data) => {
    	let result = await AddWinAmt(data.playerId);  //db 
    	socket.emit(events.OnTakeAmount, result);
    });
}



//this even is only for debugging purposes
function OnTest(data) {
 	let socket = data[commonVar.socket];
	socket.on(commonVar.test, async (data) => {
       
    })
}












//game timers------------------------------------------
	
	async function ResetTimers() {
		timer = timerVar.bettingTimer;
		gameState = state.canBet;
		RoundCount = await setRoundCount();
	    Sockets.to(gameRoom).emit(events.OnTimerStart);
	    debug("betting...");
	    OnTimerStart();
	}

	async function OnTimerStart() {
	    timer--;
	    switch (timer) {
	        case  12:
	            debug("stop betting")
		        Sockets.to(gameRoom).emit(events.OnTimeUp);
		        break;    
	        case  6: 
	            gameState = state.cannotBet;
	            debug("winning no calculate")
		    	sendWinningNo()
	            break;
	        case  0:
		        await sleep(timerVar.intervalDalay);
		        debug("Waiting...");
		        ResetTimers();
		        return;     
        }

	    await sleep(timerVar.delay);
	    OnTimerStart();
	}

	function sleep(ms) {
	    return new Promise((resolve) => {
	        setTimeout(resolve, ms);
	    });
	}
	
//game timers-----------------END-------------------------




//---------------Send API Timer------------------------------
	async function gameTimer() {
	    return new Promise((resolve) => {
	        resolve(timer)
	    });
	}
//----------------------END----------------------------------





module.exports.StartFunTrGame = StartFunTargetTimerGame;
module.exports.GetSocket = GetSocket;
module.exports.gameTimer = gameTimer;