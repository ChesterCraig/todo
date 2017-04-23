const baseUrl = "http://localhost:8080";

$(document).ready(function(e) {
    var $selectedTask = undefined;

    // JQuery UI to apply formatting
    $('#add-todo').button({ icons: { primary: "ui-icon-circle-plus" } });

    //Connect the two to-do lists and make them sortable
    $('.sortlist').sortable({ 
        connectWith : '.sortlist', //connect lists based on the .sortlist class
        cursor : 'pointer',
        placeholder : 'ui-state-highlight',
        cancel : '.delete,.done', //exlude these child elements from the dragging beheaviour
        receive: function( event, ui ) {
            //Update server when todo is moved accross lists
            //console.log("Event:",event);
            //console.log("ui:",ui);
 
            console.log("selected li: " + ui.item[0].id);
            console.log("Parent ul list: " + $('#' + ui.item[0].id).parent().attr('id'));

            if ($('#' + ui.item[0].id).parent().attr('id') === 'completed-list') {
                updateTask(ui.item[0].id,{completed: true});  //Completed
             } else {
                 updateTask(ui.item[0].id,{completed: false}); //Back to incomplete
             }
        }}
    );
    
    // Add action on add-todo button to display form dialog
    $('#add-todo').button({
        icons: { primary: "ui-icon-circle-plus" }}).click(
        function() { $('#new-todo').dialog('open');
    }); 

    // Make new-todo a modal dialog with Add task and Cancel buttons
    $('#new-todo').dialog({
        modal : true, autoOpen : false, buttons : {
            "Add task" : function () {
                var taskName = $('#task').val(); // Get value from dialog
                if (taskName === '') { 
                    // abort if user provides an invalid todo description
                    return false; 
                }

                //invoke AJAX to create new task on server
                addTask({item: taskName}); //<--- this will trigger repsonse from server which will rebuild
                $(this).dialog('close');
                $('#task').val(''); //wipe value in form
            },
            "Cancel" : function () { 
                $(this).dialog('close'); 
            }
        }
    });

    //===COMPLETED===
    $('#todo-list').on('click', '.done', function() {
        var $taskItem = $(this).parent('li'); 
        $taskItem.slideUp(250, function() {
            updateTask($(this).attr('id'),{completed: true});
        });
    });

    //===REMOVE==
    // Add behaviour to the todolist-delete when clicked to open confirmation dialog
    $('.sortlist').on('click','.delete',function() { 
        $selectedTask = $(this).parent('li'); 
        $('#remove-todo').dialog('open');
    });

    // Make remove-todo a modal dialog and add Confirm and Cancel buttons and behaviour
    $('#remove-todo').dialog({
        modal : true, autoOpen : false, buttons : {
        "Confirm " : function () {
            //Send delete command to server
            console.log("Requesting to remove: " + $selectedTask.attr('id'));
            removeTask($selectedTask.attr('id'));
            $selectedTask.effect('puff', function() { 
                $(this).remove(); 
            });
            $selectedTask = undefined;
            $(this).dialog('close');
        },
        "Cancel" : function () { 
            $selectedTask = undefined;
            $(this).dialog('close');  
        }}
    });

    //===EDIT==
    // Add behaviour to the todolist-edit when clicked to open confirmation dialog
    $('#todo-list').on('click','.edit',function() { 
        $selectedTask = $(this).parent('li'); 
        $('#editingTask').val($selectedTask.find('.task').text()); //preset value in form
        $('#edit-todo').dialog('open');
    });

    // Make edit-todo a modal dialog and add Confirm and Cancel buttons and behaviour
    $('#edit-todo').dialog({
        modal : true, autoOpen : false, buttons : {
        "Confirm " : function () {
            //Need to stop users from being able to update with nothing
            console.log("Modify todo to new val " + $('#editingTask').val());

            //$selectedTask.find('.task').text($('#editingTask').val()); //update task with new name
            updateTask($selectedTask.attr('id'),{item: $('#editingTask').val()});
            $selectedTask = undefined;
            $(this).dialog('close');
        },
        "Cancel" : function () { 
            $selectedTask = undefined;
            $(this).dialog('close');  
        }}
    });

    //Load existing todos
    loadAllTasks();
}); // end ready



//Create todo
function renderTodo(todo) {
    //This function renders a todo to the page.
    //If the todo already exists then this function will update it

    //Check if todo already exists in dom
    var $existingElem = $('#'+ todo.id);
    if ($existingElem.length) {
        //Update text (possible it's not changed)
        $existingElem.find('.task').text(todo.item);

        //Check if element is in correct list and check if 
        if (($existingElem.parent('ul').attr('id') === 'todo-list') && (todo.completed === true)) {
            //Move from todo to completed
            $existingElem.detach();
            $('#completed-list').prepend($existingElem); 
            $existingElem.slideDown();

        } else if (($existingElem.parent('ul').attr('id') === 'completed-list') && (todo.completed === false)) {
            //Move from complted to todo
            $existingElem.detach();
            $('#todo-list').prepend($existingElem); 
            $existingElem.slideDown();
        }
    } else {
        // Todo is new to client.. add
        var taskHTML = '<li><span class="done">%</span>'; 
        taskHTML += '<span class="edit">+</span>'; 
        taskHTML += '<span class="delete">x</span>';   
        taskHTML += '<span class="task"></span></li>';

        var $newTask = $(taskHTML); 
        $newTask.find('.task').text(todo.item);
        $newTask.attr('id',todo.id);
        $newTask.hide(); 
        if (todo.completed === true) {
            $('#completed-list').prepend($newTask); 
        } else {
            $('#todo-list').prepend($newTask); 
        }
        $newTask.show('clip',250).effect('highlight',1000);
    }
}


//AJAX Functions
//Create new todo
function addTask(item){
	$.ajax({
    method: 'POST',
    url: baseUrl + "/todos",
    data: JSON.stringify(item),
	 contentType: "application/json",
	 dataType: "json"
 }).then(ajaxSuccess, ajaxFail);
}

//update an existing todo
function updateTask(id, changes){
	$.ajax({
    method: 'PUT',
    url: baseUrl + "/todo/" + id,
    data: JSON.stringify(changes),
	contentType: "application/json",
	dataType: "json"
 }).then(ajaxSuccess, ajaxFail);
}

function loadAllTasks() {
	$.ajax({
    method: 'GET',
    url: baseUrl + "/todos",
    }).then(ajaxSuccess, ajaxFail);
}

function removeTask(id) {
	$.ajax({
    method: 'DELETE',
    url: baseUrl + "/todo/" + id,
 }).then(ajaxSuccess, ajaxFail);
}


//AJAX callbackss
function ajaxSuccess(data) {
    //loop through any returned todos and render them/updates
    for (var i = 0; i < data.length; i++) {
        renderTodo(data[i]);
    }
};

function ajaxFail(data) {
	console.log('Fail.', data);
};

/*
Bug: clicking enter when new task dialog is open completely wipes the page, need to change default form submission behaviour to do 'Confirm' button instead
*/