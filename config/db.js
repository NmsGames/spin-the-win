"use strict"
var mysql  = require("mysql");
const debug = require("debug")("test");
var util = require('util')

var pool = mysql.createPool({
  connectionLimit : 5000,
  connectTimeout  : 60 * 60 * 1000,
  acquireTimeout  : 60 * 60 * 1000,
  timeout         : 60 * 60 * 1000,  
  host: "127.0.0.1",
  user: "root",
  password: "SpinNmsdev#1234",
  database: "SpinTheWin",
// user: "root",
//   password: "",
//   database: "SpinWin",
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})

pool.query = util.promisify(pool.query) 

module.exports = pool;




































































































// var db_config = {
//   host: 'remotemysql.com',
//     user: 'QGLTneiA02',
//     password: 'QGLTneiA02',
//     database: 'QGLTneiA02'
// };

// var connection;

// function handleDisconnect() {
//   connection = mysql.createConnection(db_config); 
                                                  

//   connection.connect(function(err) {             
//     if(err) {                                     
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000); 
//     }             
//      console.log("Mysql coonect")                        
//   });                                     
                                          
//   connection.on('error', function(err) {
//     console.log('db error', err);
//     if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
//       handleDisconnect();                        
//     } else {                                      
//       throw err;                                 
//     }
//   });
// }

// handleDisconnect();

// module.exports = connection;

























