var pg = require('pg');
var fs = require('fs');

//Parse configuration file containing info needed to connect to database
var config = JSON.parse(fs.readFileSync('./db/config.txt', 'utf8'));

var connectionString = `postgres://${config.username}:${config.password}@${config.location}`;
var client = new pg.Client(connectionString); 
client.connect();

client.initTodoSchema = function (callback) {
    //Setup table in database if not setup
    var qry = "CREATE TABLE IF NOT EXISTS todo ( ";
    qry = qry + "id serial primary key, ";
    qry = qry + "item character varying(255), ";
    qry = qry + "completed boolean ";
    qry = qry + ")";


    var query = client.query(qry, function(error, result){
        if (error){
            console.log('Failed to run init schema query. Server not started.');
            throw error;
        } else {
            callback();   
        }
    });
}

module.exports = {client};



// var pg = require('pg');
 
// // instantiate a new client 
// // the client will read connection information from 
// // the same environment variables used by postgres cli tools 
// var client = new pg.Client();
 
// // // connect to our database 
// // client.connect(function (err) {
// //   if (err) throw err;
 
// //   // execute a query on our database 
// //   client.query('SELECT $1::text as name', ['brianc'], function (err, result) {
// //     if (err) throw err;
 
// //     // just print the result to the console 
// //     console.log(result.rows[0]); // outputs: { name: 'brianc' } 
 
// //     // disconnect the client 
// //     client.end(function (err) {
// //       if (err) throw err;
// //     });
// //   });
// // });

// module.exports = {client};