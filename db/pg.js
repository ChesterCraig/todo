var pg = require('pg');
var fs = require('fs');

//Get connection information for database
if (process.env.DATABASE_URL) {
    //Heroku hosted database
    var connectionString = process.env.DATABASE_URL
} else {
    //Connect to database
    var config = JSON.parse(fs.readFileSync('./db/config.txt', 'utf8'));
    var connectionString = `postgres://${config.username}:${config.password}@${config.location}`;
}

console.log(`Database connection: ${connectionString}`);

//Parse configuration file containing info needed to connect to database
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
