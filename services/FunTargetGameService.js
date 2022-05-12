const debug = require("debug")("test");
const db = require("../config/db.js");
const bcrypt = require('bcrypt');
const moment = require('moment'); 
const {sendResponse,GetRandomNo,isValidArray} = require('./AppService');



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
        let sql =  `SELECT * FROM (SELECT * FROM current_round WHERE round_count != ? ORDER BY cr_id DESC LIMIT ?) sub ORDER BY cr_id ASC`
        let data = await db.query(sql, [RoundCount,limit] );
        if(isValidArray(data)){
            for (var i = 0; i < data.length; i++) {
            	let RoundCount = data[i].round_count;
            	let winNo  = data[i].win_no;
            	let winx = data[i].win_x; 
                result[i]= {RoundCount,winNo,winx};
            }
        }
        return result;
    } catch (err) {
        debug(err);
    }    
}




async function PreviousRoundBet(req){
	let message;
	let status =404;
	let data = {}
    try{
    	let {playerId} = req;
    	if(!playerId) return sendResponse(status,"Invalid player.",data);

    	let result = {'no_0':0,'no_1':1,'no_2':0,'no_3':0,'no_4':0,'no_5':0,'no_6':0,'no_7':0,'no_8':0,'no_9':0};

    	let sql = 'SELECT * FROM `round_report` WHERE  player_id=? ORDER BY id DESC LIMIT ?';
	    let betsData = await db.query(sql,[playerId,1]);

	    if(isValidArray(betsData)){
	    	result['no_0'] = betsData[0]['no_0'];
	    	result['no_1'] = betsData[0]['no_1'];
	    	result['no_2'] = betsData[0]['no_2'];
	    	result['no_3'] = betsData[0]['no_3'];
	    	result['no_4'] = betsData[0]['no_4'];
	    	result['no_5'] = betsData[0]['no_5'];
	    	result['no_6'] = betsData[0]['no_6'];
	    	result['no_7'] = betsData[0]['no_7'];
	    	result['no_8'] = betsData[0]['no_8'];
	    	result['no_9'] = betsData[0]['no_9'];
	    }	

	    status  = 200;
        message = 'Pre Bet';
        data    = result
        return sendResponse(status,message,data);
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

		const{playerId,round_count,gameId,points,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9} = req;

		let checkUser = await userById(playerId);

		if(checkUser.length == 0) return sendResponse(status,"Invalid User.",data);
        
        let user = checkUser[0];
		let distId = user.distributor_id;

		//if(round_count != CurrRoundCount) return {status,message:"You Are Playing Wrong Round.",data};

	    let sql = 'SELECT * FROM `round_report` WHERE  player_id=? AND distributor_id=? And round_count=? And game=?';
	    let checkRound = await db.query(sql,[playerId,distId,CurrRoundCount,gameId]);

	    if(checkRound.length > 0) return sendResponse(status,"Already bet is Confirm.",data);

	    let userPoints = await getUserPoints(playerId);

	    if(userPoints < points) return sendResponse(status,"player not have enough balance.",data);
	    sql = `INSERT INTO round_report (distributor_id,round_count,player_id,game,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
		let saveBet = await db.query(sql,[distId,CurrRoundCount,playerId,gameId,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9,date]);

		let updateBal = userPoints - points;
		let saveBal = await saveUserPoints(updateBal,playerId);

		let saveCurrBet =  await saveCurrentBets(req,CurrRoundCount);
		
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

    	let WinNo = GetRandomNo(0,9);
    	let WinX = '1x';

     	let sql = `INSERT INTO current_round (round_count, win_no , win_x) VALUES (?,?,?)`;
		let saveRoundCount = await db.query(sql,[RoundCount,WinNo,WinX]);

		let records = [RoundCount,0,0,0,0,0,0,0,0,0,0,date];
		let saveCurrBet = await db.query("INSERT INTO current_bet (round_count,no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9,created_at) VALUES ?", [ [records] ]);
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

        let nMode = await db.query("SELECT mode FROM night_mode limit ?",[1]);
        let jMode = await db.query("SELECT mode FROM joker limit ?",[1]);

        if (isValidArray(nMode) && isValidArray(jMode) ){
        	let nightMode = nMode[0].mode;
        	let jokerMode = jMode[0].mode;
        }

        let sql = `SELECT * FROM current_round WHERE round_count=? limit ?`;
	    let roundData = await db.query(sql,[RoundCount,1]); 

	    if(!isValidArray(roundData)) return sendResponse(status,"Unable to send winning no..",data);
	    let win_no = roundData[0].win_no;
	    let winX = roundData[0].win_x;
	    status  = true;
        message = 'Winning No';
        data    = {RoundCount,win_no,winX}
        return sendResponse(status,message,data);
    } catch (err){
        debug(err);
	}  
}






async function calcWinningAmount (RoundCount){
	let game_id = 3;
	let playeWinningArray = [];

    try {

	    let roundData = await db.query("SELECT * FROM current_round WHERE round_count=? limit ?",[RoundCount,1]);

	    if(isValidArray(roundData)){

            let win_no = roundData[0].win_no;
	        let winX = roundData[0].win_x;
	        let xrate = winningRate(winX);
	    	
	        let sql =  `SELECT player_id FROM round_report WHERE game= ? AND round_count= ? AND status= ? GROUP BY player_id `;
            let players = await db.query(sql,[game_id,RoundCount,1]);

            if(isValidArray(players)){

            	for(let player of players ){
            		let playerId = player.player_id; 

            		let sql =  `SELECT * FROM round_report WHERE round_count= ? AND player_id= ? AND game= ? AND status= ? limit ? `;
                    let playerBets = await db.query(sql,[RoundCount,playerId,game_id,1,1]);

                    if(isValidArray(playerBets)){

                    	for(let bet of playerBets ){
                    		let win_points =  0;
                    		let {no_0,no_1,no_2,no_3,no_4,no_5,no_6,no_7,no_8,no_9} = bet;

                    		switch (win_no) {
					            case 0: win_points = no_0 * xrate; break;
					            case 1: win_points = no_1 * xrate; break;
					            case 2: win_points = no_2 * xrate; break;
					            case 3: win_points = no_3 * xrate; break;
					            case 4: win_points = no_4 * xrate; break;
					            case 5: win_points = no_5 * xrate; break;
					            case 6: win_points = no_6 * xrate; break;
					            case 7: win_points = no_7 * xrate; break;
					            case 8: win_points = no_8 * xrate; break;
					            case 9: win_points = no_9 * xrate; break;
					        }

						    let isWinAmtadd = (win_points > 0) ? 0 : 1;

						    sql = `UPDATE round_report SET winning_amount=?, win_X=?, win_no=?, is_winning_amount_add=?, status=? WHERE round_count= ? AND player_id= ? AND game= ? `;
                            let update_sql = await db.query(sql,[win_points,winX,win_no,isWinAmtadd,2,RoundCount,playerId,game_id]);

                            if(win_points > 0) playeWinningArray.push({win_no,RoundCount,playerId,win_points})
                        }		
                    } 	
                }

                debug("Winning amount successfuly updated in db") 		
            } 
	    }
	    return playeWinningArray;

    } catch (err){
        debug(err);
	}  
}

function winningRate(winX){
	let winRate = 9;
	if(winX === '1x') winRate;
	if(winX === '2x') winRate = 18;
	if(winX === '4x') winRate = 36;
	return winRate;
}


async function PendingWinAmount (playerId){
	try {
	    let result = null;
		let checkUser = await userById(playerId);

	    if(!isValidArray(checkUser)) return result;

	    let sql =  `SELECT win_no,winning_amount,round_count FROM round_report WHERE is_winning_amount_add= ? AND player_id= ? ANd status= ? ORDER BY id DESC limit ? `;
	    let report = await db.query(sql,[0,playerId,2,1]);

	    if(!isValidArray(report)) return result;

		let RoundCount = report[0].round_count;
		let win_no     = report[0].win_no
		let winPoints  = report[0].winning_amount;
		result = {RoundCount,win_no,winPoints}
		return result

    } catch (err){
        debug(err);
	}  
}	








async function AddWinAmt(playerId){
	let message;
	let status =404;
	let data = {};
    try {

    	let checkUser = await userById(playerId);

    	if(!isValidArray(checkUser)) return sendResponse(status,"Invalid User.",data);

     	let sql =  `SELECT winning_amount,round_count FROM round_report WHERE is_winning_amount_add= ? AND player_id= ? ANd status= ? ORDER BY id DESC limit ? `;
        let report = await db.query(sql,[0,playerId,2,1]);

        if(isValidArray(report)){

	        let winPoints = report[0].winning_amount;
	        let RoundCount = report[0].round_count;

	        let userPoints = await getUserPoints(playerId);
	        let Points     = userPoints + winPoints;
	        let savePoints = await saveUserPoints(Points,playerId);

	        sql = `UPDATE round_report SET  is_winning_amount_add=? WHERE round_count= ? AND player_id= ? `;
	        let update_sql = await db.query(sql,[1,RoundCount,playerId]);

	        status  = true;
            message = 'Successfully winning amount added';
            data    = {playerId,balance:Points}
	        return sendResponse(status,message,data);

	    } else {
	    	return sendResponse(status,"Winning amount already added.",data);
	    }  
    } catch (err){
        debug(err);
	}  

}




module.exports = {getUserPoints,PreviousWinData,JoinGame,setRoundCount,calcWinningNo,calcWinningAmount,AddWinAmt,PendingWinAmount,PreviousRoundBet};