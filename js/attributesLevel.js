    var attrLevelTableID = 'attrLevelTable';

    //
    // Attribute Object and Array
    //
    function CreateAttributesLevel() {
        this.attributeID = 0,
        this.name = 0,
        this.level1 = 0,
        this.level2 = 0,
        this.level3 = 0,
        this.level4 = 0,
        //HTML Control
        this.rowID = "",
        this.recordStatus = ""
    }
    //var objAttrLevel = new CreateAttributesLevel();
    //var arrayAttrLevel = [];


    $('body').on('change', 'input', function() { 
        updateAttrLevel(this.id);
    });

    //$('body').on('change', 'select.form-control', function() { 
    //    updateAttr(this.id);
    //});

    //
    // ATTRIBUTES X LEVELS
    //
    function createAttrLevel(objAttr) {
        "use strict";
        
        if (null == objAttr || "object" != typeof objAttr)
            var objAttr = new CreateAttributesLevel();
        
        if (objAttr.level1 > 0)
            objAttr.level1 = 'checked';

        if (objAttr.level2 > 0)
            objAttr.level2 = 'checked';
        
        if (objAttr.level3 > 0)
            objAttr.level3 = 'checked';
        
        if (objAttr.level4 > 0)
            objAttr.level4 = 'checked';
        
        objAttr.recordStatus = 'query';
        objAttr.rowID = "row" + objAttr.attributeID;
        
        //Render Attributes
        var attrID = objAttr.attributeID;
        
        $('#'+attrLevelTableID).find('tbody')
            .append($("<tr id='" + objAttr.rowID + "'>")
                .append($('<td>')
                    .append($("<label id='attrID" + attrID + "'>" + attrID + "</label>"))
                )
                .append($('<td>')
                    .append($("<label id='attrName" + attrID + "'>" + objAttr.name + "</label>"))
                )
                .append($('<td>')
                    .append($("<input type='checkbox' id='level1_" + attrID + "' name='optcheck' " + objAttr.level1 + ">"))
                )
                .append($('<td>')
                    .append($("<input type='checkbox' id='level2_" + attrID + "' name='optcheck' " + objAttr.level2 + ">"))
                )
                .append($('<td>')
                    .append($("<input type='checkbox' id='level3_" + attrID + "' name='optcheck' " + objAttr.level3 + ">"))
                )
                .append($('<td>')
                    .append($("<input type='checkbox' id='level4_" + attrID + "' name='optcheck' " + objAttr.level4 + ">"))
                )
                .append($('<td>')
                    .append($("<input id='recordStatus" + attrID + "' type='hidden' value='" + objAttr.recordStatus + "'> "))
                )
            );
    }

    //
    function updateAttrLevel(targetID) {
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
    function queryAttrLevel(operation) {
        "use strict";
        
        var changes = checkAttrLevelChanges();
        
        if (!changes) {
            
            $("#"+attrLevelTableID + " > tbody").html("");
            
            //Query Attributes x Level from DB
            queryAttributesLevelDB('queryRows');
        }
    }

    //
    function checkAttrLevelChanges(){
        "use strict";
        
        var countUpd = 0;
        
        var arrayAttributesNew = [];
        
        arrayAttributesNew = getAllAttrLevelRows('');
        
        for (var i=0; i < arrayAttributesNew.length; i++)
            if (arrayAttributesNew[i].recordStatus == "update")
                countUpd++;
        
        var msg = "";
        
        if (countUpd > 0)
            msg = msg + " - updated Attributes: " + countUpd + "\n";
        
        if (msg != "") {
            msg = "There are unsaved changes: \n" + msg + "\n Do you want to continue?";
            return !confirm(msg);
        }
        
        return false;
    }

    //
    function saveAttrLevel() {
        "use strict";
        
        //Insert, Update, Delete Attributes Level into DB
        saveAttributesLevelDB();
        
    }

    //
    function getNumberID(generalID) {
        "use strict";
        
        var num = "";
        
        for (var i=generalID.length - 1; i >= 0; i-- )
            if (!isNaN(generalID[i]))
                num = generalID[i] + num;
            else
                break;

        return (Number(num));
    }

    //
    function getAllAttrLevelRows (recordStatus) {
        
        var table = document.getElementById(attrLevelTableID);
        var rowLength = table.rows.length;
        var arrayAttributes = [];
        
        if (rowLength == 1) //first row is header
            return arrayAttributes;
        
        for(var i=1; i<rowLength; i++){ //first row is header
            
            var row = table.rows[i];
            var cellLength = row.cells.length;
            
            var objAttr = new CreateAttributesLevel();
            
            for(var y=0; y<cellLength; y++){
                
                var inputComponent = row.cells[y].firstChild;
                
                switch(y) {
                    case 0:
                        objAttr.attributeID = inputComponent.innerHTML;
                        break;
                    case 1:
                        objAttr.name = inputComponent.innerHTML;
                        break;
                    case 2:
                        if (inputComponent.checked) objAttr.level1 = 1; else objAttr.level1 = 0;
                        break;
                    case 3:
                        if (inputComponent.checked) objAttr.level2 = 1; else objAttr.level2 = 0;
                        break;
                    case 4:
                        if (inputComponent.checked) objAttr.level3 = 1; else objAttr.level3 = 0;
                        break;
                    case 5:
                        if (inputComponent.checked) objAttr.level4 = 1; else objAttr.level4 = 0;
                        break;
                    case 6:
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
    function queryAttributesLevelDB(oper) {
        "use strict";

        var json_obj = "";
        
        var request = $.ajax({
            url: "../php/attributesLevelModel.php",
            method: "POST",
            data: { operation: oper, objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getAttributesLevelDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert("Server request failed: " + textStatus);
        });
        
    }

    //
    function getAttributesLevelDB(dataFromServer) {
        "use strict";
        
        var str = dataFromServer;
        var strLines = str.split(CONS_JSON_SEP);
        
        var json_oper = JSON.parse(strLines[0]); //parse JSON Operation
        var json_obj = JSON.parse(strLines[1]); //parse JSON Data
        
        if (json_oper.message != "OK") {
            alert(json_oper.name + " " + json_oper.message);
            return;
        }
        
        //create Attributes x Levels: DOM Elements
        var count = 0;
        for (var i in json_obj) {
            createAttrLevel(json_obj[i]);
            count++;
        }
        displayMessage(count + " Rows have been retrieved from DB.", "new");

    }

    //
    function saveAttributesLevelDB() {
        "use strict";
        
        var arrayAttributesNew = [];
        
        arrayAttributesNew = getAllAttrLevelRows('update');
        
        if (arrayAttributesNew.length == 0)
            return;
        
        var json_obj = JSON.stringify(arrayAttributesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "../php/attributesLevelModel.php",
            method: "POST",
            data: { operation: 'save', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getSaveResultAttrLevelDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });

    }

    //
    function getSaveResultAttrLevelDB(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data
        
        var count = 0;
        for (var i in json_obj){
            if (json_obj[i].recordStatus == 'inserted' || json_obj[i].recordStatus == 'deleted') {
                var id = getNumberID(json_obj[i].attributeID);
                var recordStatus = document.getElementById('recordStatus'+id);
                recordStatus.value = 'query';
                var attrID = "attrID" + id;
                $('#'+attrID).css('background-color', '');
                $('#'+attrID).css('color', '');
                count++;
            }
        }
        displayMessage(count + " Rows have been saved into DB. <br/>", "new");
    }
