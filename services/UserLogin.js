const debug = require("debug")("test");
const db = require("../config/db.js");
const bcrypt = require('bcrypt');
const moment = require('moment');
const {sendResponse} = require('./AppService');



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


const userLogin = async(req) => {
	console.log('userLogin',req)
    let message;
	let status =404;
	let data = {};
    try{	
	   const {user_id,password,device} = req;
	   let sql = `SELECT * FROM user WHERE user_id=? limit ?`;
	   let player = await db.query(sql,[user_id,1]); 
	  
	    if(player.length>0) {  

			if (player[0].IsBlocked != 0) return sendResponse(status=203,"Your Account is Blocked. Please Contact Administrator.",data)

			let hashpswd = player[0].password;  
			let confirmPassword =  await bcrypt.compare(password, hashpswd);  
			if(!confirmPassword) return sendResponse(status=404,"Password Incorrect.",data) 
			if(player[0].active ===1 && player[0].device != device) return sendResponse(status=202,"You have active session from other location do you want close that ??.",data);

			let lastLoggedIn = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			let sql1 = `UPDATE user SET last_logged_in=? , device=?, active =? WHERE user_id =?`;
			let check = await db.query(sql1,[lastLoggedIn ,device,1,player[0].user_id]);

			let userPoins = await getUserPoints(player[0].user_id);
			let sendNtfc  = await sendNotificationToAdmin(player[0].user_id);
 
			data = {
				id: player[0].id,
				distributor_id:player[0].distributor_id,
				user_id: player[0].user_id,
				username: player[0].username,
				IMEI_no: player[0].IMEI_no,
				device: player[0].device,
				last_logged_in:player[0].last_logged_in,
				last_logged_out: player[0].last_logged_out,
				IsBlocked: player[0].IsBlocked,
				// password: player[0].password,
				coins: userPoins,
				active: player[0].active,
			  }
			status = 200; 
			message = 'Login Successfully';
			return sendResponse(status,message,data);
		   
	    } else {
           return sendResponse(status,"User not found.",data);
	    }
	} catch (err){
            debug(err);
			return sendResponse(500,"Database error.",data);
	}   
}

async function sendNotificationToAdmin(playerId){
	try{
		let date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
		let sql = `INSERT INTO admin_notification (distributor_id, points ,status ,created_at) VALUES (?,?,?,?)`;
		let save = await db.query(sql,[playerId,0,4,date]);
	    return true;
	} catch (err){
        debug(err);
	}      
}


const forceLogin = async(req) => {
    let message;
	let status =404;
	let data = {};
    try{	
	   const {user_id,password,device} = req;
	   let sql = `SELECT * FROM user WHERE user_id=? limit ?`;
	   let check = await db.query(sql,[user_id,1]);

	    if(check.length>0) {
	   	    for (let player of check ){

	            if (player.IsBlocked != 0) return sendResponse(status=203,"Your Account is Blocked. Please Contact Administrator.",data)

	            let hashpswd = player.password;
	   	        
	            let confirmPassword =  await bcrypt.compare(password, hashpswd);

	            if(!confirmPassword) return sendResponse(status=404,"Username and Password Incorrect.",data)

	            let lastLoggedIn = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
	            let sql = `UPDATE user SET last_logged_in=? , device=?, active =? WHERE user_id =?`;
	            let check = await db.query(sql,[lastLoggedIn ,device,1,player.user_id]);

	            let userPoins = await getUserPoints(player.user_id);
	            let sendNtfc  = await sendNotificationToAdmin(player.user_id);

	            player.coins = userPoins;
                status = 200;
                message = 'Login Successfully';
	            return sendResponse(status,message,player);
			}    
	    } else {
           return sendResponse(status,"User not found.",data);
	    }
	} catch (err){
            debug(err);
	}   
}

const userSignUp = async(req) => {
	console.log('req',req)
    let message;
	let status =404;
	let data = {};
    try{	
	   const {user_id,password,device} = req;
	   let sql = `SELECT * FROM user WHERE user_id=? limit ?`;
	   let check = await db.query(sql,[user_id,1]);

	    if(check.length>0) {
	   	    
                status = 200;
                message = 'User Already exist';
	            return sendResponse(status,message,check);
		 
	    } else {
			const encryptedPassword = await bcrypt.hash(password, 10)
		 
			const formData = {
				distributor_id:'DIS000001',
				user_id,
				password:encryptedPassword,
				device
			};
			console.log('formData',formData)
			let sql1 = `INSERT INTO user Set ?`;
			 let user = await db.query(sql1,formData);
			 if(user){
				 message = "CReated";
			 }else{
				 message = "Something went wrong!";
			 }
           return sendResponse(status,message,data);
	    }
	} catch (err){
		console.log('err',err)
		debug(err);
	}   
}
/**
 * Desc : Get user profile details  
 * Req  :{ user_id}
 * Function : userProfile
 */
 const userProfile = async (req) => {
    let message;
    let status = 404;
    let data   = {};
    try {
        const {user_id} = req;

        if (!user_id) return sendResponse(status, "User Id is required!", data)
        
		let sql = `SELECT * FROM user INNER JOIN user_points on user_points.user_id =user.user_id WHERE user.user_id=?`;
	    let check = await db.query(sql,[user_id,1]);
       
        if(check.length>0){
			status = 200;
            message = 'My Profile';  
            data = {
                username    	: check[0].username?check[0].username:`Guest0${user_id}`,
				total_points    : check[0].points,
                last_logged_in  : check[0].last_logged_in,
				device_id		: check[0].device,
				last_logged_out : check[0].last_logged_out,
				imei_no			: check[0].IMEI_no,
			}
		}else{
			status = 404;
            message = 'Invalid user ID';  

		} 
     return sendResponse(status, message, data);
         
    } catch (err) {
		return sendResponse(500, 'Server Error', data);
    }
}

module.exports = {
	userLogin,
	forceLogin,
	userSignUp,
	userProfile
}