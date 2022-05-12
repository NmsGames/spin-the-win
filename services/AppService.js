const debug = require("debug")("test");


function sendResponse(status,message,data) {
	return {
        status : (!status) ? 404 : status,
        message : message,
        data : data
	}
}


const  isValidArray = (arr) => {
    if(arr!=null && arr!=undefined && arr.length>0) {
        return true
    } else {
        return false
    }
}
 

function GetRandomNo(min, max) {// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min)
}



function inArray(target, array){
	for(var i = 0; i < array.length; i++) {
	    if(array[i] === target) return true;
	}
	return false; 
}




module.exports = {
	sendResponse,
	isValidArray,
	GetRandomNo,
	inArray,
};