const express = require('express');
const bodyParser = require("body-parser");

const {client} = require("./db/pg");


//create express app
var app = express();

//Define port as either env variable or 8080 
var port = process.env.PORT || 8080;

//Define path where public files live (client facing website)
const publicPath = "./public";

//body parser middleware
app.use(bodyParser.json());


//Setup middleware to serve up anything in public folder (including our main website)
app.use(express.static(publicPath));


// //Middleware to log all requests
// app.use((req,res,next) => {
//     var msg = `${new Date().toString()}: ${req.method} ${req.url}`;
//     console.log(msg);
//     next();
// });


//========API=======
//GET ALL TODOS
app.get('/todos', (request,response) => {
    console.log("Get all todos");
    var query = client.query("SELECT id, item, completed FROM todo"); 
    var results = [];
    // Stream resultcls back one row at a time into array
    query.on('row', function(row) {
        results.push(row); 
    });
    
    // After all data is returned, close connection and return results 
    query.on('end', function() {
        response.json(results); 
    });
});

//GET SPECIFIC TODO
app.get('/todo/:id', (request,response) => {
    console.log("Get specific todo: " + request.params.id);
    if ((request.params.id) && (request.params.id > 0)) {
        var query = client.query(`SELECT id, item, completed FROM todo WHERE id = ${request.params.id}`);
        var results = [];
    
        // Stream results back one row at a time 
        query.on('row', function(row) {
            results.push(row); 
        });
    
        // After all data is returned, close connection and return results 
        query.on('end', function() {
            response.json(results); 
        });
    } else {
        return response.status(404).send("todo ID is invalid");
    }
});

//CREATE A NEW TODO (only accepts item value)
app.post('/todos', function(request, response){
    //body parser used 
    console.log("Create todo with data", request.body);
      if (request.body.item) {
         var query = client.query(`INSERT INTO todo (item,completed) VALUES ('${request.body.item}',False) RETURNING id, item, completed`);
         var results = [];
    
        // Stream results back one row at a time 
        query.on('row', function(row) {
            results.push(row); 
        });
    
        // After all data is returned, close connection and return results 
        query.on('end', function() {
            response.json(results); 
        });
    } else {
        return response.status(404).send("Invalid todo item value provided.");
    }
});


//UPDATED A Todo (item and/or completed flag)
app.put('/todo/:id', function(request, response){
	console.log("Update todo with data: ", request.body);
    if ((request.params.id) && ((request.body.completed === true || request.body.completed === false) || (request.body.item))) {
        var qryString = `UPDATE todo SET `;

        //Add completed flag update if provided
        if (request.body.completed === true || request.body.completed === false) {
            qryString = qryString + `completed = ${request.body.completed},`
        }
        
        //Add item update if provided
        if (request.body.item) {
            qryString = qryString + `item = '${request.body.item}',`;
        }

        //trim extra comma
        qryString = qryString.substring(0,qryString.length - 1);
        qryString = qryString + ` WHERE id = ${request.params.id}`;
        var query = client.query(qryString, function(error, result){
            if (error){
                return response.status(404).send(`Failed to update todo: ${request.params.id} ${ error}`);
            } else {
                
                //SEND UPDATED JSON TODO BACK
                var query = client.query(`SELECT id, item, completed FROM todo WHERE id = ${request.params.id}`);
                var results = [];
    
                // Stream results back one row at a time 
                query.on('row', function(row) {
                    results.push(row); 
                });
    
                // After all data is returned, close connection and return results 
                query.on('end', function() {
                    response.json(results); 
                });
            }
        });
    } else {
        return response.status(404).send("todo ID is invalid");
    }
});


//DELETE A SINGLE TODO
app.delete('/todo/:id', function(request, response){
    console.log("Delete: " + request.params.id);
	if ((request.params.id) && (request.params.id > 0)) {
        var query = client.query(`DELETE FROM todo WHERE id = ${request.params.id}`, function(error, result) {
            if (error){
                return response.status(404).send("Failed to delete todo: " + error);
            }
        });       
    } else {
        return response.status(404).send("todo ID is invalid");
    }
});

//Initalise schema if required and start server
client.initTodoSchema(() => {        
    //Start web server
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});
