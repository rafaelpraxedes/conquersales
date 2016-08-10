    var nodeAttributesID = 'nodeAttributes';

    //
    // Attribute Object and Array
    //
    function CreateNodeAttributes() {
        this.nodeID = 0,
        this.levelID = 0,
        this.attributeID = 0,
        this.attributeName = 0,
        this.attributeType = 0,
        this.attributeValue = 0,
        //HTML Control
        this.elementID = "",
        this.recordStatus = ""
    }
    var objNodeAttr = new CreateNodeAttributes();
    var arrayNodeAttr = [];


    $('body').on('change', 'input.form-control', function() {
        updateNodeAttr(this.id);
    });

    $('body').on('change', 'select.form-control', function() {
        updateNodeAttr(this.id);
    });

    //
    // NODE x ATTRIBUTES
    //
    function createNodeAttr(objAttr) {
        "use strict";
        
        if (null == objAttr || "object" != typeof objAttr)
            var objAttr = new CreateNodeAttributes();
        
        objAttr.recordStatus = 'query';
        objAttr.elementID = "attrID" + objAttr.attributeID;
        
        arrayNodeAttr.push(objAttr);
        
        //Render Attributes
        var attrID = objAttr.elementID;
        var attrValue = objAttr.attributeValue;
        if (attrValue == null || attrValue == "")
            attrValue = "";
        else
            attrValue = " value='" + attrValue + "'";
        
        var attrFormat = "";
        if (objAttr.attributeType == 'Date')
            attrFormat = "data-date-format='YYYY-MM-DD'";
        
        $('#'+nodeAttributesID).find(nodeAttributesID)
            .append($('#'+nodeAttributesID)
                .append($("<label for='" + attrID + "'>" + objAttr.attributeName + "</label>"))
                .append($("<input type='text' id='" + attrID + "' class='form-control' " + attrFormat + " " + attrValue + " >"))
            );
    }

    //
    function updateNodeAttr(targetID) {
        "use strict";
        
        var targetID = document.getElementById(targetID);
        var index = getNodeAttrID(targetID.id);
        
        arrayNodeAttr[index].attributeValue = targetID.value;
        arrayNodeAttr[index].recordStatus = 'update';
        
        $(targetID).css('color', 'blue');
    }

    //
    function queryNodeAttr(nodeID) {
        "use strict";
        
        var changes = checkNodeAttrChanges(nodeID);
        
        if (!changes) {
            
            $('#'+nodeAttributesID).html("");
            arrayNodeAttr.splice(0,arrayNodeAttr.length);
            
            //Query Attributes of Nodes from DB
            queryNodeAttrDB('queryRows', nodeID);
        }
    }

    //
    function getNodeAttrID(elementID){
        "use strict";
        
        var index = 0;
        
        //Find Node within Array of Node Attributes
        for (var i=0; i < arrayNodeAttr.length; i++) {
            if (elementID == arrayNodeAttr[i].elementID) {
                index = i;
                break;
            }
        }
        
        return index;
    }

    //
    function checkNodeAttrChanges(nodeID) {
        "use strict";
        
        var countUpd = 0;
        
        for (var i=0; i < arrayNodeAttr.length; i++)
            if (arrayNodeAttr[i].recordStatus == "update")
                countUpd++;
        
        var msg = "";
        
        if (countUpd > 0)
            msg = msg + " - updated Node Attributes: " + countUpd + "\n";
        
        if (msg != "") {
            msg = "There are unsaved changes: \n" + msg + "\n Do you want to continue?";
            return !confirm(msg);
        }
        
        return false;
    }

    //
    function saveNodeAttr() {
        "use strict";
        
        var nodeID = getNodeAttribute(selectedDivNodeID, 'nodeID');
        
        //Update Node Attributes into DB
        saveNodeAttrDB(nodeID);
        
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
    // PHP and DB Interface
    //

    //
    function queryNodeAttrDB(oper, nodeID) {
        "use strict";

        var objAttr = new CreateNodeAttributes();
        var json_obj = "";
        
        objAttr.nodeID = nodeID;
        var json_obj = JSON.stringify(objAttr); //Stringify to JSON
        
        var request = $.ajax({
            url: "php/nodeAttributesModel.php",
            method: "POST",
            data: { operation: oper, objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getNodeAttrDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert("Server request failed: " + textStatus);
        });
        
    }

    //
    function getNodeAttrDB(dataFromServer) {
        "use strict";
        
        var str = dataFromServer;
        var strLines = str.split(CONS_JSON_SEP);
        
        var json_oper = JSON.parse(strLines[0]); //parse JSON Operation
        var json_obj = JSON.parse(strLines[1]); //parse JSON Data
        
        if (json_oper.message != "OK") {
            alert(json_oper.name + " " + json_oper.message);
            return;
        }
        
        //create Attribute: DOM Elements
        for (var i in json_obj)
            createNodeAttr(json_obj[i]);

    }

    //
    function saveNodeAttrDB(nodeID) {
        "use strict";
        
        if (arrayNodeAttr.length == 0)
            return;
        
        var json_obj = JSON.stringify(arrayNodeAttr); //Stringify to JSON
        
        var request = $.ajax({
            url: "php/nodeAttributesModel.php",
            method: "POST",
            data: { operation: 'save', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getSaveResultNodeAttrDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });

    }

    //
    function getSaveResultNodeAttrDB(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data

        var count = 0;
        for (var i in json_obj) {
            if (json_obj[i].recordStatus == 'updated') {
                var targetID = document.getElementById(json_obj[i].elementID);
                var index = getNodeAttrID(targetID.id);
                arrayNodeAttr[index].attributeValue = targetID.value;
                arrayNodeAttr[index].recordStatus = 'query';
                $(targetID).css('color', '');
                count++;
            }
        }
        displayMessage(count + " Rows have been saved into DB. <br/>", "new");
    }
