readme.

This is node js based todo list application.
All client code and publicly accessable files sit under the Public dir.

Database:
The connection to the databse is handled through a seperate js file sitting under the db dir. Inside here you will find a config.txt file containing one JSON file. This JSON file can be used to define the database connection strings required to connect to your database. If the application is run from an environment where the following variable is available (such as Heroku) process.env.DATABASE_URL then it will opt to use this instead of the credentials stored in db/config.txt. I did not create a postgres database on the ECS machines, instead I created a database locally on my personal laptop and then another hosted in Heroku (Aaron indicated this was acceptable). When the server application is run it will stand up a todo schema if it doesn't already exists before servicing client requests.

Heroku version is available:
https://todo-nwen304.herokuapp.com/

The application works in the same manner as the original todo list design.
With the excepetion of dragging todos from one list to another, changes are requested against the server and when the server responds with the updated todo to re-render/update on the client side. Each todo is identified by the id on the LI on the client side which matches the id in the database.

REST interface design:

GET /todos      Gets all todos in array of todo objects
GET /todo/12    Gets specific todo object returned as json in a array
POST /todos     Creates a new todo. details of todo must be in body of request as JSON (item)
PUT /todo/12    Updates/replaces the todo. details must be in body of request as JSON (item,completed)
DELETE /todo/12 Deletes the todo

The variation between /todo and /todos was made to better distinguish the modification/fetching or a single resource against the fetching of multiple resources.

Error handling:
Client side error handling is limited, as most actions are a result of the requests/response to the server and server side failures should be represented as a 4xx/5xx http code response.

Server side error checking consists of:
-db conenction error checking and error throwing
-todo table setup query error checking and error throwing
-validation against missing required JSON parameters and throwing of 400 status code http responses
-validation against failed query execution and throwing 500 status code http response.