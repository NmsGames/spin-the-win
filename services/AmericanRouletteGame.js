const debug = require("debug")("test");
const db = require("../config/db.js");
const bcrypt = require('bcrypt');
const moment = require('moment'); 
const CrossPay  = require("../Constants").AmrcnRulteWinRate;
const selectRange  = require("../Constants").AmrcnRulteSpotRange; 
const {sendResponse,GetRandomNo,inArray,isValidArray} = require('./AppService');




async function getUserPoints(playerId){
	try{
		let points = 0;
		let sql = `SELECT * FROM user_points WHERE user_id=? limit ?`;
		let user = await db.query(sql,[playerId,1]);
		if(user.length>0) points = user[0].points;
	    return points;
    } catch (err){
        debug(err);
	}   
}

async function saveUserPoints(points,playerId){
	try{

		sql = `UPDATE user_points SET points= ? WHERE user_id= ? `;
        let saveBalance  = await db.query(sql,[points,playerId]);
	    return true;
    } catch (err){
        debug(err);
	}   
}

async function userById(playerId){
    try{
        let sql = `SELECT * FROM user WHERE user_id=? limit ?`;
	    let user = await db.query(sql,[playerId,1]);
        return user;
    } catch (err) {
        debug(err);
    }     
}

async function PreviousWinData(RoundCount){
    try{
        let limit = 10;
        let result = new Array(limit);
        let sql =  `SELECT * FROM (SELECT * FROM american_roulette_records WHERE round_count != ? ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`
        let data = await db.query(sql, [RoundCount,limit] );
        if(isValidArray(data)){
            for (var i = 0; i < data.length; i++) {
            	let RoundCount = data[i].round_count;
            	let winNo  = data[i].win_no;
                result[i]= {RoundCount,winNo};
            }
        }
        return result;
    } catch (err) {
        debug(err);
    }    
}




const JoinGame = async(req,CurrRoundCount,gameState) => {
	let message;
	let status =404;
	let data = {}
	let records;
	try {

		let date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        if(gameState === 0) return sendResponse(status,"Please wait for game.",data);

		const{playerId,round_count,gameId,bet_info,total_chips} = req;

		let checkUser = await userById(playerId);

		if(checkUser.length == 0) return sendResponse(status,"Invalid User.",data);
        
        let user = checkUser[0];
		let distId = user.distributor_id;

		//if(round_count != CurrRoundCount) return {status,message:"You Are Playing Wrong Round.",data};

	    let sql = 'SELECT * FROM `american_roulette_report` WHERE  player_id=? AND distributor_id=? And round_count=? And game_id=?';
	    let checkRound = await db.query(sql,[playerId,distId,CurrRoundCount,gameId]);

	    if(checkRound.length > 0) return sendResponse(status,"Already bet is Confirm.",data);

	    let playerBal = await getUserPoints(playerId);

	    if(playerBal < total_chips) return sendResponse(status,"player not have enough balance.",data);

	    if(bet_info.length < 0) return sendResponse(status,"empty bets.",data);

	    for(let bets of bet_info ){
	    	let {spot , chips} = bets;
	    	sql = `INSERT INTO american_roulette_report (distributor_id,round_count,player_id,game_id,spot,amount,created) VALUES (?,?,?,?,?,?,?)`;
		    let saveBet = await db.query(sql,[distId,CurrRoundCount,playerId,gameId,spot,chips,date]);

	    }

		let updateBal = playerBal - total_chips;
		let saveBal = await saveUserPoints(updateBal,playerId);

		// let saveCurrBet =  await saveCurrentBets(req,CurrRoundCount);
		
        status  = 200;
        message = 'Bet Confirmed';
        data    = {playerId,balance:updateBal}
        return sendResponse(status,message,data);

    } catch (err){
        debug(err);
	}   
    
}

async function saveCurrentBets(data,CurrRoundCount){
	const{playerId,round_count,gameId,points,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9} = data;
	let records;
	let checkBet = await db.query('SELECT * FROM current_bet WHERE round_count =? limit ?',[CurrRoundCount ,1]);
	if(checkBet.length === 0) {
		records = [CurrRoundCount,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9];
	}else {
		let bet = checkBet[0];
		records = [CurrRoundCount,no_0+bet.no_0, no_1+bet.no_1, no_2+bet.no_2, no_3+bet.no_3, no_4+bet.no_4, no_5+bet.no_5, no_6+bet.no_6, no_7+bet.no_7, no_8+bet.no_8, no_9+bet.no_9 ];
	}
	let saveCurrBet = await db.query("INSERT INTO current_bet (round_count,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9) VALUES ?", [ [records] ]);
    return true;
}




async function setRoundCount(){
	let D = new Date();
	let RoundCount = D.getTime();
	let date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    try {
    	let WinNo = GetRandomNo(0,37);
     	let sql = `INSERT INTO american_roulette_records (round_count, win_no,created ) VALUES (?,?,?)`;
		let saveRoundCount = await db.query(sql,[RoundCount,WinNo,date]);
        return RoundCount;
    } catch (err){
        debug(err);
	}  

}







async function calcWinningNo(RoundCount){
	let message;
	let status =404;
	let data = {}
    try {

        if(RoundCount === undefined)  return sendResponse(status,"failed to calculate winning no..",data); 

        let sql = `SELECT * FROM american_roulette_records WHERE round_count=? limit ?`;
	    let roundData = await db.query(sql,[RoundCount,1]); 

	    if(!isValidArray(roundData)) return sendResponse(status,"Unable to send winning no..",data);
	    let win_no = roundData[0].win_no;
	    status  =  200;
        message = 'Winning No';
        data    = {RoundCount,win_no}
        return sendResponse(status,message,data);
    } catch (err){
        debug(err);
	}  
}









async function calcWinningAmount (RoundCount,game_id){
	let playeWinningArray = [];

    try {

	    let roundData = await db.query("SELECT * FROM american_roulette_records WHERE round_count=? limit ?",[RoundCount,1]);

	    if(isValidArray(roundData)){

            let win_no = roundData[0].win_no;
	    	
	        let sql =  `SELECT player_id FROM american_roulette_report WHERE game_id= ? AND round_count= ? AND is_updated= ? GROUP BY player_id `;
            let players = await db.query(sql,[game_id,RoundCount,0]);

            if(isValidArray(players)){

            	for(let player of players ){
            		let playerId = player.player_id; 
            		let TotalWinningAmt = 0;

            		let sql =  `SELECT * FROM american_roulette_report WHERE round_count= ? AND player_id= ? AND game_id= ? `;
                    let playerBets = await db.query(sql,[RoundCount,playerId,game_id]);

                    if(isValidArray(playerBets)){

                    	for(let bet of playerBets ){
                    		let joinGameId = bet.id;
                    		let spot = bet.spot;
                    		let betAmt = bet.amount;

                    	    let xRate = winningRate(spot,win_no);

                    	    let winAmt = betAmt * xRate;

                    	    if(winAmt > 0) {
                    	    	TotalWinningAmt += winAmt;
                    	    	sql = `UPDATE american_roulette_report SET win_amount=? WHERE id=? AND round_count= ? AND player_id= ? AND game_id= ? `;
                                let update_sql = await db.query(sql,[winAmt,joinGameId,RoundCount,playerId,game_id]);
                            }
                        }	

                        if(TotalWinningAmt > 0) {
                        	playeWinningArray.push({RoundCount,playerId,TotalWinningAmt});
                        	let userPoints = await getUserPoints(playerId);
					        let Points     = userPoints + TotalWinningAmt;
					        let savePoints = await saveUserPoints(Points,playerId);	
                        } 
                    } 	
                }

                let update_round = await db.query(`UPDATE american_roulette_report SET is_updated=? WHERE  round_count= ? AND game_id= ? `,[1,RoundCount,game_id]);	
            } 

            debug("Winning amount successfuly updated in db") 	
	    }
	    return playeWinningArray;
    } catch (err){
        debug(err);
	}  
}


function winningRate(spot,winNo){
	let win_rate = 0;

	if(spot >= 0 && spot <= 37 ){ //single Bets

        if(spot === winNo) win_rate = CrossPay.singleBet;

	} else if (spot >= 38 && spot <= 43) { //columns & Dozen Bets

	    let spotArr = selectRange[spot];
	    let check  = inArray(winNo, spotArr)
	    if(check === true) win_rate = CrossPay.columnAndDozenBet;

	} else if (spot === 44 || spot === 45) { //low & high bets(1-18,18-36)

		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.straightBet;

	} else if (spot === 46 || spot === 47) { //even & odd bets

		let check = (spot === 46) ? (winNo % 2 === 0) : (winNo % 2 !== 0);
		if(check === true) win_rate = CrossPay.straightBet;

	} else if (spot === 48 || spot === 49) { //red & black bets

		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.straightBet;

	} else if (spot >= 50 && spot <= 109) { //Split Bets(Two No)
		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.splitBet;

	} else if (spot >= 110 && spot <= 124) { //Street Bet(Three No)
		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.StreetBet;

	} else if (spot >= 125 && spot <= 146) { //Street Bet(Four No)
		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.cornerBet;

	} else if (spot === 147) { //basket Bet(Five No Bet)
		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.basketBet;

	} else if (spot >= 148 && spot <= 158) { //(Six No Bet)
		let spotArr = selectRange[spot];
		let check  = inArray(winNo,spotArr)
		if(check === true) win_rate = CrossPay.lineBet;
	} 

	return win_rate
}





async function AddWinAmt(playerId){
	let message;
	let status =404;
	let data = {};
    try {

    	let checkUser = await userById(playerId);

    	if(!isValidArray(checkUser)) return sendResponse(status,"Invalid User.",data);

        let userPoints = await getUserPoints(playerId);
	        
        status  = true;
        message = 'Successfully winning amount added';
        data    = {playerId,balance:userPoints}
        return sendResponse(status,message,data); 

    } catch (err){
        debug(err);
	}  

}















module.exports = {getUserPoints,PreviousWinData,JoinGame,setRoundCount,calcWinningNo,calcWinningAmount,AddWinAmt};