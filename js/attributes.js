    var attrTableID = 'attributesTable';
    var currentAttrID = 0;

    //
    // Attribute Object and Array
    //
    function CreateAttribute() {
        this.attributeID = 0,
        this.name = "",
        this.description = "",
        this.attribute_type	= "",
        this.default_value = "",
        this.list_values = "",
        //HTML Control
        this.rowAttributeID = "",
        this.recordStatus = ""
    }
    //var objAttribute = new CreateAttribute();
    //var arrayAttributes = [];

    $('body').on('change', 'input.form-control', function() { 
        updateAttr(this.id);
    });

    $('body').on('change', 'select.form-control', function() { 
        updateAttr(this.id);
    });

    //
    // ATTRIBUTES
    //
    function createAttr(status, objAttr) {
        "use strict";
        
        if (null == objAttr || "object" != typeof objAttr)
            var objAttr = new CreateAttribute();
        
        //from screen
        if (status=="new") { 
            //
            currentAttrID = currentAttrID + 1;
            //
            objAttr.attributeID = currentAttrID;
            objAttr.name = "";
            objAttr.description = "";
            objAttr.attribute_type = "";
            objAttr.default_value = "";
            objAttr.list_values = ""; 
            //
        }
        
        // New or Query
        objAttr.recordStatus = status;
        objAttr.rowAttributeID = "row" + objAttr.attributeID;
        
        //Set Array of Attributes
        //arrayAttributes.push(objAttr);
        
        //Render Attributes
        var attrID = objAttr.attributeID;
        
        $('#'+attrTableID).find('tbody')
            .append($("<tr id='" + objAttr.rowAttributeID + "'>")
                .append($('<td>')
                    .append($("<input type='radio' id='attrOpt" + attrID + "' name='optradio'>"))
                )
                .append($('<td>')
                    .append($("<label id='attrID" + attrID + "'>" + attrID + "</label>"))
                )
                .append($('<td>')
                    .append($("<input id='attrName" + attrID + "' type='text' class='form-control' value='" + objAttr.name + "'>"))
                )
                .append($('<td>')
                    .append($("<input id='attrDesc" + attrID + "' type='text' class='form-control' value='" + objAttr.description + "'>"))
                )
                .append($('<td>')
                    .append($("<select id='attrType" + attrID + "' class='form-control' value='" + objAttr.attribute_type + "'>")
                        .append($("<option value='Text'>Text</option> <option value='Number'>Number</option> <option value='Date'>Date</option>")
                        )
                    )
                )
                .append($('<td>')
                    .append($("<input id='attrDefault" + attrID + "' type='text' class='form-control' value='" + objAttr.default_value + "'>"))
                )
                .append($('<td>')
                    .append($("<input id='attrListValues" + attrID + "' type='text' class='form-control' value='" + objAttr.list_values + "'> "))
                )
                .append($('<td>')
                    .append($("<input id='recordStatus" + attrID + "' type='hidden' value='" + objAttr.recordStatus + "'> "))
                )
            );
        
            // Adjust Select - Type
            var attrType = document.getElementById('attrType'+attrID);
            attrType.value = objAttr.attribute_type;
        
    }

    //
    function updateAttr(targetID) {
        "use strict";
        
        var id = getNumberID(targetID);
        var recordStatus = document.getElementById('recordStatus'+id);
        
        if (recordStatus.value != 'new') {
            recordStatus.value = 'update';
            $('#attrID'+id).css('background-color', 'blue');
            $('#attrID'+id).css('color', 'white');
        }
    }

    //
    function removeAttr(ev) {
        "use strict";
        
        var attrOptID = "";
        
        var index = $('#' + attrTableID +' tr').length;
        
        if (index==1) //Row 1 is the Header
            return;
        
        $('#' + attrTableID + ' input:radio:checked').each(function () {
            attrOptID = this.id;
        });
        
        if (attrOptID=="") {
            alert("Please select a row to be removed.")
            return;
        }
        
        var id = getNumberID(attrOptID);
        var recordStatus = document.getElementById('recordStatus'+id);
        var rowID = "row" + id;
        var attrID = "attrID" + id;
        
        if (recordStatus.value=="new") {
            //Remove Node from DOM
            $('#'+rowID).remove();
        } else {
            recordStatus.value = 'delete';
            $('#'+attrID).css('background-color', 'red');
            $('#'+attrID).css('color', 'white');
        }
        
    }

    //
    function queryAttr(operation) {
        "use strict";
        
        var changes = checkAttrChanges();
        
        if (!changes) {
            
            $("#"+attrTableID + " > tbody").html("");
            
            //Query Attributes from DB
            queryAttributesDB('queryRows');
            
            queryAttributesDB('getLastID');
        }
    }

    //
    function checkAttrChanges(){
        "use strict";
        
        var countNew = 0;
        var countUpd = 0;
        var countDel = 0;
        
        var arrayAttributesNew = [];
        
        arrayAttributesNew = getAllAttributeRows('');
        
        for (var i=0; i < arrayAttributesNew.length; i++)
            if (arrayAttributesNew[i].recordStatus == "new")
                countNew++;
            else if (arrayAttributesNew[i].recordStatus == "update")
                countUpd++;
            else if (arrayAttributesNew[i].recordStatus == "delete")
                countDel++;
        
        var msg = "";
        
        if (countNew > 0)
            msg = " - new Attributes: " + countNew + "\n";
        if (countUpd > 0)
            msg = msg + " - updated Attributes: " + countUpd + "\n";
        if (countDel > 0)
            msg = msg + " - deleted (marked to) Attributes: " + countDel + "\n";
        
        if (msg != "") {
            msg = "There are unsaved changes: \n" + msg + "\n Do you want to continue?";
            return !confirm(msg);
        }
        
        return false;
    }

    //
    function saveAttr() {
        "use strict";
        
        //Insert Attributes into DB
        insertAttributesDB();
        
        //Update Attributes into DB
        updateAttributesDB();
        
        //Delete Attributes into DB
        deleteAttributesDB();
        
    }

    //
    function setAttrAttribute(rowAttributeID, attribute, value) {
        "use strict";
        
        var row = document.getElementById(rowAttributeID);
        var inputComponent;
                
        switch(attribute) {
            case 'attributeID':
                inputComponent = row.cells[1].firstChild;
                inputComponent.innerHTML = value;
                break;
            case 'name':
                inputComponent = row.cells[2].firstChild;
                inputComponent.value = value;
                break;
            case 'description':
                inputComponent = row.cells[3].firstChild;
                inputComponent.value = value;
                break;
            case 'attribute_type':
                inputComponent = row.cells[4].firstChild;
                inputComponent.value = value;
                break;
            case 'default_value':
                inputComponent = row.cells[5].firstChild;
                inputComponent.value = value;
                break;
            case 'list_values':
                inputComponent = row.cells[6].firstChild;
                inputComponent.value = value;
                break;
            case 'recordStatus':
                inputComponent = row.cells[7].firstChild;
                inputComponent.value = value;
                break;
        }
    }

    //
    function getAttrAttribute(rowAttributeID, attribute) {
        "use strict";
        
        var row = document.getElementById(rowAttributeID);
        var inputComponent;
        var value;
                
        switch(attribute) {
            case 'attributeID':
                inputComponent = row.cells[1].firstChild;
                value = inputComponent.innerHTML;
                break;
            case 'name':
                inputComponent = row.cells[2].firstChild;
                value = inputComponent.value;
                break;
            case 'description':
                inputComponent = row.cells[3].firstChild;
                value = inputComponent.value;
                break;
            case 'attribute_type':
                inputComponent = row.cells[4].firstChild;
                value = inputComponent.value;
                break;
            case 'default_value':
                inputComponent = row.cells[5].firstChild;
                value = inputComponent.value;
                break;
            case 'list_values':
                inputComponent = row.cells[6].firstChild;
                value = inputComponent.value;
                break;
            case 'recordStatus':
                inputComponent = row.cells[7].firstChild;
                value = inputComponent.value;
                break;
        }
        
        return (value);
    }

    //
    function getNumberID(generalID) {
        "use strict";
        
        var num = "";
        
        for (var i=generalID.length - 1; i >= 0; i-- )
            if (!isNaN(generalID[i]))
                num = generalID[i] + num;

        return (Number(num));
    }

    //
    function getAllAttributeRows (recordStatus) {
        
        var table = document.getElementById(attrTableID);
        var rowLength = table.rows.length;
        var arrayAttributes = [];
        
        if (rowLength == 1) //first row is header
            return arrayAttributes;
        
        for(var i=1; i<rowLength; i++){ //first row is header
            
            var row = table.rows[i];
            var cellLength = row.cells.length;
            
            var objAttr = new CreateAttribute();
            
            for(var y=1; y<cellLength; y++){ //first cell is option
                
                var inputComponent = row.cells[y].firstChild;
                
                switch(y) {
                    case 1:
                        objAttr.attributeID = inputComponent.innerHTML;
                        break;
                    case 2:
                        objAttr.name = inputComponent.value;
                        break;
                    case 3:
                        objAttr.description = inputComponent.value;
                        break;
                    case 4:
                        objAttr.attribute_type = inputComponent.value;
                        break;
                    case 5:
                        objAttr.default_value = inputComponent.value;
                        break;
                    case 6:
                        objAttr.list_values = inputComponent.value;
                        break;
                    case 7:
                        objAttr.recordStatus = inputComponent.value;
                        break;
                }
            }
            
            //Check if some Status has been required to be filtered
            if (objAttr.recordStatus == recordStatus || recordStatus == '' || recordStatus == null )
                arrayAttributes.push(objAttr);
        }        
        
        return arrayAttributes;
    }


    //
    // PHP and DB Interface
    //

    //
    function queryAttributesDB(oper) {
        "use strict";

        var json_obj = "";
        
        var request = $.ajax({
            url: "../php/attributesModel.php",
            method: "POST",
            data: { operation: oper, objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getAttributesDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert("Server request failed: " + textStatus);
        });
        
    }

    //
    function getAttributesDB(dataFromServer) {
        "use strict";
        
        var str = dataFromServer;
        var strLines = str.split(CONS_JSON_SEP);
        
        var json_oper = JSON.parse(strLines[0]); //parse JSON Operation
        var json_obj = JSON.parse(strLines[1]); //parse JSON Data
        
        if (json_oper.message != "OK") {
            alert(json_oper.name + " " + json_oper.message);
            return;
        }
        
        if (json_oper.name == "getLastID") {
            
            currentAttrID = Number(json_oper.value);
            //displayMessage("Last Attribute ID: " + currentAttrID, "new");
            
        } else if (json_oper.name == "queryRows") {

            //create Attribute: DOM Elements
            var count = 0;
            for (var i in json_obj) {
                createAttr('query', json_obj[i]);
                count++;
            }
            displayMessage(count + " Attributes have been retrieved from DB.", "new");
        }

    }

    //
    function insertAttributesDB() {
        "use strict";
        
        var arrayAttributesNew = [];
        
        arrayAttributesNew = getAllAttributeRows('new');
        
        if (arrayAttributesNew.length == 0)
            return;
        
        var json_obj = JSON.stringify(arrayAttributesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "../php/attributesModel.php",
            method: "POST",
            data: { operation: 'insert', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getInsertResultAttrDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });

    }

    //
    function getInsertResultAttrDB(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data

        var count = 0;
        for (var i in json_obj) {
            if (json_obj[i].recordStatus == 'inserted') {
                var id = getNumberID(json_obj[i].attributeID);
                var recordStatus = document.getElementById('recordStatus'+id);
                recordStatus.value = 'query';
                var attrID = "attrID" + id;
                $('#'+attrID).css('background-color', '');
                $('#'+attrID).css('color', '');
                count++;
            }
        }
        displayMessage(count + " Attributes have been inserted into DB.", "new");
    }

    //
    function updateAttributesDB() {
        "use strict";
        
        var arrayAttributesNew = [];
        
        arrayAttributesNew = getAllAttributeRows('update');
        
        if (arrayAttributesNew.length == 0)
            return;
        
        var json_obj = JSON.stringify(arrayAttributesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "../php/attributesModel.php",
            method: "POST",
            data: { operation: 'update', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getUpdateResultAttrDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });

    }

    //
    function getUpdateResultAttrDB(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data
        
        var count = 0;
        for (var i in json_obj) {
            if (json_obj[i].recordStatus == 'updated') {
                var id = getNumberID(json_obj[i].attributeID);
                var recordStatus = document.getElementById('recordStatus'+id);
                recordStatus.value = 'query';
                var attrID = "attrID" + id;
                $('#'+attrID).css('background-color', '');
                $('#'+attrID).css('color', '');   
                count++;
            }
        }
        displayMessage(count + " Attributes have been updated into DB.", "new");
    }

    //
    function deleteAttributesDB() {
        "use strict";
        
        var arrayAttributesNew = [];
        
        arrayAttributesNew = getAllAttributeRows('delete');
        
        if (arrayAttributesNew.length == 0)
            return;
        
        var json_obj = JSON.stringify(arrayAttributesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "../php/attributesModel.php",
            method: "POST",
            data: { operation: 'delete', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getDeleteResultAttrDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });

    }

    //
    function getDeleteResultAttrDB(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data
        
        var count = 0;
        for (var i in json_obj) {
            if (json_obj[i].recordStatus == 'deleted') {
                var id = getNumberID(json_obj[i].attributeID);
                var rowID = "row" + id;
                //Remove Node from DOM
                $("#"+rowID).remove();
                count++;
            }
        }
        displayMessage(count + " Attributes have been deleted from DB.", "new");
    }