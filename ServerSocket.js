const debug = require("debug")("test");
const {userLogin,forceLogin,userSignUp} = require("./services/UserLogin");
const events = require("./Constants").events;
const commonVar = require("./Constants").commonVar;
const MatchMaking = require("./utils/MatchMaking").MatchPlayer;
const playerManager  = require('./utils/PlayerDataManager');



function createSocket(io){

	// io.use(function(socket, next){
	// 	if (socket.request.headers.cookie) return next();
	//     next(new Error('Authentication error'));
	// });

	io.on("connection", (socket) => {
	    console.log(socket.id);
	    DissConnect(socket);
	    UserLogin(socket);
		userSignUp(socket);
	    RegisterToGameRoom(socket)
	    ForceLogin(socket)
	})


	function DissConnect(socket) {
	    socket.on("disconnect", () => {
	        debug("player got dissconnected " + socket.id);
            playerManager.RemovePlayer(socket.id);
	    })
	}

	function userSignUp(socket){
		socket.on(events.OnSignUp, async(data) =>{
			let result = await userSignUp(data); 
            socket.emit(events.OnSignUp,result);
	    })
	}
	function UserLogin(socket){
		socket.on(events.OnLogin, async(data) =>{
			let result = await userLogin(data);
			// if(result.status === 200) addPlayerToRoom(result.data,socket);
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
	
}

module.exports.createSocket = createSocket;