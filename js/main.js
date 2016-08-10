    var controlOutputID = document.getElementById("controlOutput");
    var selectedNodeID = document.getElementById("selectedNodeID");

    var generalShapeSelector = "generalShape";
    var generalShapeCSS = " " + generalShapeSelector + " ui-widget-content child ";
    var shapeDragATTR = " draggable=true ondragstart='drag(event)' ";
    var drawContainerID = "drawContainer";

    var CONS_JSON_SEP = '###OBJECTSEPARATOR###';

    var currentNodeID = 0;
    var selectedDivNodeID = "";

    var defaultXPos = 60;
    var defaultYPos = 60;
    var defaultWidth = 100;
    var defaultHeight = 100;
    var offsetX = 0;
    var offsetY = 0;

    //
    // Node Object and Array
    //
    function CreateNode() {
        this.nodeID = 0,
        this.name = "node",
        this.xPos = 0,
        this.yPos = 0, 
        this.zIndex = 0, 
        this.width = 0, 
        this.height = 0,
        this.class = "",
        this.style = "",
        this.parentID = 0, 
        this.levelID = 0,
        //HTML Control
        this.divNodeID = "",
        this.recordStatus = ""
    }
    //var objNode = new CreateNode();
    var arrayNodes = [];

    //
    //
    //
    function setup(page) {
        "use strict";
        
        if (page == 'home') {
            queryNodesDB('getLastID');
        }
    }

    //
    // Drag and Drop
    //
    function drag(ev) {
        "use strict";

        //ev.dataTransfer.setData("text", ev.target.id);
        ev.dataTransfer.setData('Text/html', ev.target.id);
        selectedDivNodeID = ev.target.id;

        displayMessage("Node " + selectedDivNodeID + " dragged...", "new");

        var oldLeft = getCssProperty(ev.target, "left");
        var oldTop = getCssProperty(ev.target, "top");
        var newLeft = ev.clientX;
        var newTop = ev.clientY;
        
        offsetX = newLeft - oldLeft;
        offsetY = newTop - oldTop;

        if (!(isValidNumber(offsetX, 0, 99999)))
            offsetX = 0;
        if (!(isValidNumber(offsetY, 0, 99999)))
            offsetY = 0;
    }

    //
    function drop(ev) {
        "use strict";

        ev.preventDefault();
        
        var left = ev.clientX - offsetX;
        var top = ev.clientY - offsetY;
        
        var nodeWidth = document.getElementById(selectedDivNodeID).offsetWidth;
        var nodeHeight = document.getElementById(selectedDivNodeID).offsetHeight;
        
        var marginLeft = 5;
        var marginTop = 5;
        var containerWidth = getCssProperty(document.getElementById(drawContainerID), "width");
        var containerHeight = getCssProperty(document.getElementById(drawContainerID), "height");
        
        containerWidth = containerWidth - marginLeft;
        containerHeight = containerHeight - marginTop;
        
        if (left < marginLeft)
            left = marginLeft;
        else if ((left + nodeWidth) > containerWidth)
            left = containerWidth - nodeWidth;
        
        if (top < marginTop)
            top = marginTop;
        else if ((top + nodeHeight) > containerHeight)
            top = containerHeight - nodeHeight;
        
        updateNodePosition(selectedDivNodeID, left, top);
    }

    //
    function allowDrop(ev) {
        "use strict";
        ev.preventDefault();
    }

    $(function() {
        $(".child").draggable({ containment: "parent" });
    });        

    //
    // Nodes control
    //
    function createNode(status, level, objNode) {
        "use strict";

        if (null == objNode || "object" != typeof objNode)
            var objNode = new CreateNode();
        
        //from screen
        if (status=="new") { 
            //
            currentNodeID = currentNodeID + 1;
            //
            objNode.nodeID = currentNodeID;
            objNode.name = "node";
            objNode.levelID = level;
            //
            var nodeSelector = objNode.name + objNode.levelID;
            //
            objNode.xPos = defaultXPos;
            objNode.yPos = defaultYPos;
            objNode.zIndex = (1000 * objNode.levelID);
            objNode.width = defaultWidth;
            objNode.height = defaultHeight;
            objNode.class = nodeSelector + generalShapeCSS;
            objNode.style = "";
            objNode.parentID = ""; 
            //
        }
        
        // New or Query
        objNode.recordStatus = status;
        objNode.divNodeID = objNode.name + objNode.nodeID;
        
        if (objNode.parentID == null || objNode.parentID.length === 0)
            objNode.parentID = '0';
        
        //Set Array of Nodes
        arrayNodes.push(objNode);
        
        //Setup DIV Element
        var s = "<div id="          + "'" + objNode.divNodeID + "'" + shapeDragATTR + 
                " nodeID="          +       objNode.nodeID + 
                " name="            + "'" + objNode.name + "'" + 
                //" xPos="            +       objNode.xPos + 
                //" yPos="            +       objNode.yPos + 
                //" zIndex="          +       objNode.zIndex + 
                //" width="           +       objNode.width + 
                //" height="          +       objNode.height + 
                " levelID="         +       objNode.levelID + 
                " parentID= "       +       objNode.parentID + 
                " class="           + "'" + objNode.class + "'" +
                " recordStatus= "   + "'" + objNode.recordStatus + "'" + 
                "></div>";
        
        //Create Node in DOM
        $(s).appendTo("#"+drawContainerID);
        
        //Get correct Width and Height according to Node level
        objNode.width = document.getElementById(objNode.divNodeID).offsetWidth;
        objNode.height = document.getElementById(objNode.divNodeID).offsetHeight;
        
        //Set style attribute
        var style = " left: "    + objNode.xPos   + "px; " + 
                    " top: "     + objNode.yPos   + "px; " +
                    " width: "   + objNode.width  + "px; " +
                    " height: "  + objNode.height + "px; " +
                    " z-index: " + objNode.zIndex;

        setNodeAttribute(objNode.divNodeID, 'style', style);
        
        //Adjust Width and Height attributes
        setNodeAttribute(objNode.divNodeID, 'width', objNode.width);
        setNodeAttribute(objNode.divNodeID, 'height', objNode.height);
        
        //Display Node Info
        displayNodeInfo(objNode.divNodeID);
        
        //displayMessage("Node " + nodeID + " has beend created. Current Node ID is " + currentNodeID, "new");
        
    }

    //
    function updateNodePosition(divNodeID, left, top) {
        "use strict";
        
        setNodeAttribute(divNodeID, 'xPos', left);
        setNodeAttribute(divNodeID, 'yPos', top);

        //Set Status
        setNodeAttribute(divNodeID, 'recordStatus', 'update');
        displayNodeInfo(divNodeID);
        
        displayMessage(" " + divNodeID + " moved to: " + left + ", " + top, "new");
        
        checkNodeRelations(divNodeID);
    }


    //
    function removeNode() {
        "use strict";

        displayMessage("", "new");
        
        if (arrayNodes.length==0){
            return;
        }
        
        if (selectedDivNodeID == ""){
            alert("No Node selected!");
            return;
        }
        
        var divNodeID = selectedDivNodeID;
        
        if ( checkNodeChild(divNodeID) > 0 ){
            alert("Node " + divNodeID + " has Child(s). It can't be deleted.");
            return;
        }
        
        if (getNodeAttribute(divNodeID, 'recordStatus') == "new"){
        
            //Focus previus Node
            focusNode(event, 'prev');
            
            //Remove Node from DOM
            $("#"+divNodeID).remove();
            
            //Remove from array of Nodes
            var index = getNodeID(divNodeID);
            arrayNodes.splice(index,1);

            //Adjust currentNodeID
            currentNodeID = Number(arrayNodes[arrayNodes.length-1].nodeID);
            
            displayMessage(" " + divNodeID + " (new) has beend removed.", "new");
            
        } else {
            
            setNodeAttribute(divNodeID, 'recordStatus', 'delete');
            displayNodeInfo(divNodeID);
            displayMessage(" " + divNodeID + " has been marked to be removed.", "new");
        }
        
    }

    //
    function queryNodes(operation) {
        "use strict";
        
        var changes = checkNodeChanges();
        
        if (!changes) {
            
            $("#"+drawContainerID).empty();
            arrayNodes.splice(0,arrayNodes.length);
            selectedDivNodeID = "";
            
            //Query Nodes from DB
            queryNodesDB('queryRows');
            
            queryNodesDB('getLastID');
        }
    }


    //
    function saveNodes() {
        "use strict";
        
        //Insert nodes into DB
        insertNodesDB(arrayNodes);
        
        //Update nodes into DB
        updateNodesDB(arrayNodes);
        
        //Delete nodes into DB
        deleteNodesDB(arrayNodes);
        
    }
    
    //
    function setNodeAttribute(divNodeID, attribute, value){
        "use strict";
        
        //Synchronization with the Object
        var index = getNodeID(divNodeID);

        //Set DOM
        switch(attribute) {
            case 'xPos':
                document.getElementById(divNodeID).style.left = value + 'px';
                break;
            case 'yPos':
                document.getElementById(divNodeID).style.top = value + 'px';
                break;
            case 'zIndex':
                document.getElementById(divNodeID).style.zIndex = value;
                break;
            case 'width':
                document.getElementById(divNodeID).style.width = value + 'px';
                break;
            case 'height':
                document.getElementById(divNodeID).style.height = value + 'px';
                break;
            case 'recordStatus':
                if (arrayNodes[index].recordStatus != "new")
                    document.getElementById(divNodeID).setAttribute(attribute, value);
                break;
            case 'recordStatusFORCE': //Exception
                document.getElementById(divNodeID).setAttribute('recordStatus', value);
                break;
            default: 
                document.getElementById(divNodeID).setAttribute(attribute, value);
        }
        
        //Always adjust style attributes
        var style = " left: "    + document.getElementById(divNodeID).style.left + 
                    " top: "     + document.getElementById(divNodeID).style.top  +
                    " width: "   + document.getElementById(divNodeID).style.width +
                    " height: "  + document.getElementById(divNodeID).style.height +
                    " z-index: " + document.getElementById(divNodeID).style.zIndex;
        
        arrayNodes[index].style = style;
        
        //Set Object
        switch(attribute) {
            case 'nodeID':
                arrayNodes[index].nodeID = value;
                break;
            case 'name':
                arrayNodes[index].name = value;
                break;
            case 'xPos':
                arrayNodes[index].xPos = value;
                break;
            case 'yPos':
                arrayNodes[index].yPos = value;
                break;
            case 'zIndex':
                arrayNodes[index].zIndex = value;
                break;
            case 'width':
                arrayNodes[index].width = value;
                break;
            case 'height':
                arrayNodes[index].height = value;
                break;
            case 'class':
                arrayNodes[index].class = value;
                break;
            case 'style':
                arrayNodes[index].style = value;
                break;
            case 'levelID':
                arrayNodes[index].levelID = value;
                break;
            case 'parentID':
                arrayNodes[index].parentID = value;
                break;
            case 'divNodeID':
                arrayNodes[index].divNodeID = value;
                break;
            case 'recordStatus':
                //Set Status
                if (arrayNodes[index].recordStatus != "new")
                    arrayNodes[index].recordStatus = value;
                break;
            case 'recordStatusFORCE': //Exception
                arrayNodes[index].recordStatus = value;
                break;
        }
    }

    //
    function getNodeAttribute(divNodeID, attribute){
        "use strict";
        
        //Synchronization with Object
        var index = getNodeID(divNodeID);
        var value;
        
        switch(attribute) {
            case 'nodeID':
                value = arrayNodes[index].nodeID;
                break;
            case 'name':
                value = arrayNodes[index].name;
                break;
            case 'xPos':
                value = arrayNodes[index].xPos;
                break;
            case 'yPos':
                value = arrayNodes[index].yPos;
                break;
            case 'zIndex':
                value = arrayNodes[index].zIndex;
                break;
            case 'width':
                value = arrayNodes[index].width;
                break;
            case 'height':
                value = arrayNodes[index].height;
                break;
            case 'class':
                value = arrayNodes[index].class;
                break;
            case 'style':
                value = arrayNodes[index].style;
                break;
            case 'levelID':
                value = arrayNodes[index].levelID;
                break;
            case 'parentID':
                value = arrayNodes[index].parentID;
                break;
            case 'divNodeID':
                value = arrayNodes[index].divNodeID;
                break;
            case 'recordStatus':
                value = arrayNodes[index].recordStatus;
                break;
        }
        
        return value;
    }

    //
    function getNodeID(divNodeID){
        "use strict";
        
        var index = 0;
        
        //Find Node within Array of Nodes
        for (var i=0; i < arrayNodes.length; i++) {
            if (divNodeID == arrayNodes[i].divNodeID) {
                index = i;
                break;
            }
        }
        
        return index;
    }

    //
    function checkNodeChild(divNodeID){
        "use strict";
        
        var index = getNodeID(divNodeID);
        var count = 0;
        
        for (var i=0; i < arrayNodes.length; i++)
            if (arrayNodes[index].nodeID == arrayNodes[i].parentID){
                count++;
                break; //performace
            }
        
        return count;
    }

    //
    function checkNodeChanges(){
        "use strict";
        
        var countNew = 0;
        var countUpd = 0;
        var countDel = 0;
        
        for (var i=0; i < arrayNodes.length; i++)
            if (arrayNodes[i].recordStatus == "new")
                countNew++;
            else if (arrayNodes[i].recordStatus == "update")
                countUpd++;
            else if (arrayNodes[i].recordStatus == "delete")
                countDel++;
        
        var msg = "";
        
        if (countNew > 0)
            msg = " - new Nodes: " + countNew + "\n";
        if (countUpd > 0)
            msg = msg + " - updated Nodes: " + countUpd + "\n";
        if (countDel > 0)
            msg = msg + " - deleted (marked to) Nodes: " + countDel + "\n";
        
        if (msg != "") {
            msg = "There are unsaved changes: \n" + msg + "\n Do you want to continue?";
            return !confirm(msg);
        }
        
        return false;
    }

    //
    function focusNode(ev, oper){
        "use strict";
        
        //Set Focus
        if (oper == 'set') {
            
            if (ev.target.id == drawContainerID)
                selectedDivNodeID = "";
            else
                selectedDivNodeID = ev.target.id;
            
            displayMessage("Focused Node: " + selectedDivNodeID, "new");
            
        } else {
            
            //Next or Previus
            var nodes = document.getElementsByName("node");

            if (nodes.length==0){
                return;
            }
            
            var index = 0;
            for(var i = 0 ; i < nodes.length ; i++) {
                if (nodes[i].getAttribute("id") == selectedDivNodeID) {
                    if (oper=='next') {
                        if ((i+1) >= nodes.length)
                            index = 0;
                        else
                            index = i + 1;
                    } else {
                        if ((i-1) < 0)
                            index = nodes.length - 1;
                        else
                            index = i - 1;
                    }
                }
            }

            selectedDivNodeID = nodes[index].getAttribute("id");
        }
        
        //Query Node Attributes
        if (selectedDivNodeID.substr(0,4) == 'node') {
            var nodeID = getNodeAttribute(selectedDivNodeID, 'nodeID');
            var levelID = getNodeAttribute(selectedDivNodeID, 'levelID');
            selectedNodeID.innerHTML = selectedDivNodeID + ' level ' + levelID;
            queryNodeAttr(nodeID);
        }
    
        displayMessage("Focused Node: " + selectedDivNodeID, "new");
        
    }

    //
    // Output control
    //
    function displayMessage(msg, type){
        "use strict";
        
        if (type=="new")
            controlOutputID.innerHTML = msg;
        else
            controlOutputID.innerHTML += msg;
    }

    //
    function displayNodeInfo(divNodeID){
        "use strict";
        
        var nodeID       = document.getElementById(divNodeID).getAttribute('nodeID');
        var recordStatus = document.getElementById(divNodeID).getAttribute('recordStatus');
        var parentID     = document.getElementById(divNodeID).getAttribute('parentID');
        //var zIndex       = document.getElementById(divNodeID).style.zIndex;
        //var nodeLevel    = document.getElementById(divNodeID).getAttribute('levelID');
        
        recordStatus = recordStatus.charAt(0);
        if (parentID=="0")
            parentID = "";
        
        document.getElementById(divNodeID).innerHTML = "ID: " + nodeID + "<br />" + 
                                                                recordStatus + "<br />" + 
                                                                //zIndex + "<br />" + 
                                                                parentID;
                                                                //"L: " + nodeLevel + "<br />";
    }


    //
    // General Functions
    //
    function getCssProperty(elementID, property){
        "use strict";

        var result = parseInt(window.getComputedStyle(elementID,null).getPropertyValue(property), 10);
        return result;
    }

    //
    function isValidNumber(inputNum, validMin, validMax) {
        "use strict";
        //
        if ( isNaN(inputNum) || inputNum < validMin || inputNum > validMax) {
            return false;
        }
        return true;
    }

    //
    // PHP and DB Interface
    //

    //
    function queryNodesDB(oper) {
        "use strict";

        var json_obj = "";
        
        var request = $.ajax({
            url: "https://rafaelpraxedes.github.io/conquersales/php/nodesModel.php",
            method: "POST",
            data: { operation: oper, objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getNodesDB(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });
        
    }

    //
    function getNodesDB(dataFromServer) {
        "use strict";
        
        var str = dataFromServer;
        var strLines = str.split(CONS_JSON_SEP);
        
        var json_oper = JSON.parse(strLines[0]); //parse JSON Operation
        var json_obj = JSON.parse(strLines[1]); //parse JSON Data
        
        if (json_oper.message != "OK") {
            alert(json_oper.name + " " + json_oper.message);
            return;
        }
        
        if (json_oper.name=="getLastID") {
            
            currentNodeID = Number(json_oper.value);
            //displayMessage("Last Node ID: " + currentNodeID, "new");
            
        } else if (json_oper.name=="queryRows") {

            //Create Nodes: DOM Elements and Object Array
            arrayNodes.splice(0,arrayNodes.length);
            var count = 0;
            for (var i in json_obj) {
                createNode('query', json_obj[i].levelID, json_obj[i]);
                count++;
            }
            displayMessage(count + " Nodes have been retrieved from DB.", "new");
        }
    }

    //
    function insertNodesDB(arrayNodes) {
        "use strict";
        
        var arrayNodesNew = [];
        
        //Only send to Server the NEW Nodes
        for(var i = 0; i < arrayNodes.length; i++)
            if (arrayNodes[i].recordStatus == "new")
                arrayNodesNew.push(arrayNodes[i]);

        if (arrayNodesNew.length == 0)
            return;
        
        var json_obj = JSON.stringify(arrayNodesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "https://rafaelpraxedes.github.io/conquersales/php/nodesModel.php",
            method: "POST",
            data: { operation: 'insert', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getInsertResult(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });
    }

    //
    function getInsertResult(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data
        
        var count = 0;
        for (var i in json_obj) {
            setNodeAttribute(json_obj[i].divNodeID, 'recordStatusFORCE', json_obj[i].recordStatus);
            displayNodeInfo(json_obj[i].divNodeID);
            count++;
        }
        displayMessage(count + " Nodes have been inserted into DB. ", "new");
        
    }

    //
    function updateNodesDB(arrayNodes) {
        "use strict";
        
        var arrayNodesNew = [];
        
        //Only send to Server the UPDATED Nodes
        for(var i = 0; i < arrayNodes.length; i++)
            if (arrayNodes[i].recordStatus == "update")
                arrayNodesNew.push(arrayNodes[i]);
        
        if (arrayNodesNew.length == 0)
            return;

        var json_obj = JSON.stringify(arrayNodesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "https://rafaelpraxedes.github.io/conquersales/php/nodesModel.php",
            method: "POST",
            data: { operation: 'update', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getUpdateResult(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });
    }

    //
    function getUpdateResult(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data
        
        var count = 0;
        for (var i in json_obj)
            if (json_obj[i].recordStatus == "updated") {
                //Mark current Node
                setNodeAttribute(json_obj[i].divNodeID, 'recordStatus', 'query');
                displayNodeInfo(json_obj[i].divNodeID);
                count++;
            }
        displayMessage(count + " Nodes have been updated into DB. ", "append");
    }

    //
    function deleteNodesDB(arrayNodes) {
        "use strict";
        
        var arrayNodesNew = [];
        
        //Only send to Server the DELETE Nodes
        for(var i = 0; i < arrayNodes.length; i++)
            if (arrayNodes[i].recordStatus == "delete")
                arrayNodesNew.push(arrayNodes[i]);
        
        if (arrayNodesNew.length == 0)
            return;

        var json_obj = JSON.stringify(arrayNodesNew); //Stringify to JSON
        
        var request = $.ajax({
            url: "https://rafaelpraxedes.github.io/conquersales/php/nodesModel.php",
            method: "POST",
            data: { operation: 'delete', objAttribute: json_obj },
            dataType: "html"
        });

        request.done(function( dataFromServer ) {
            getDeleteResult(dataFromServer);
        });

        request.fail(function( jqXHR, textStatus ) {
            alert( "Server request failed: " + textStatus );
        });
    }

    //
    function getDeleteResult(dataFromServer) {
        "use strict";
        
        //displayMessage(dataFromServer, "new");
        
        var json_obj = JSON.parse(dataFromServer); //parse JSON Data
        
        var count = 0;
        for (var i in json_obj){
            if (json_obj[i].recordStatus == "deleted"){
                
                //Remove Node from DOM
                $("#"+json_obj[i].divNodeID).remove();
            
                //Remove from array of Nodes
                var index = getNodeID(json_obj[i].divNodeID);
                arrayNodes.splice(index,1);
                
                //Adjust currentNodeID
                currentNodeID = Number(arrayNodes[arrayNodes.length-1].nodeID);
                count++;
            }
        }
        displayMessage(count + " Nodes have been deleted from DB. ", "append");
    }

    //
    //
    //
    function checkNodeRelations(divNodeID0) {
        "use strict";
        
        var nodes;
        var relType;
        var divNodeID1 = 0;
        var divNodeID0Level = 0;
        var divNodeID1Level = 0;
        var countParent = 0;
        var countChild = 0;
        
        //displayMessage("", "new");

        nodes = document.getElementsByName("node");
        
        for(var i = 0 ; i < nodes.length ; i++) {
            
            if (nodes[i].getAttribute('ID') != divNodeID0) {
                
                divNodeID0Level = document.getElementById(divNodeID0).getAttribute('levelID')
                divNodeID1 = nodes[i].getAttribute('ID');
                divNodeID1Level = nodes[i].getAttribute('levelID');
                
                //Only check relations among Nodes different one level
                if (Math.abs(divNodeID0Level - divNodeID1Level) == 1) {
                    
                    relType = checkOverlapping(divNodeID0, divNodeID1);

                    if (relType == "parent"){

                        var nodeID = document.getElementById(divNodeID0).getAttribute('nodeID');
                        setNodeAttribute(divNodeID1, 'parentID', nodeID);
                        setNodeAttribute(divNodeID1, 'recordStatus', 'update');
                        setNodeAttribute(divNodeID0, 'recordStatus', 'update');
                        displayNodeInfo(divNodeID1);
                        countParent++;

                    } else if (relType == "child"){

                        var nodeID = document.getElementById(divNodeID1).getAttribute('nodeID');
                        setNodeAttribute(divNodeID0, 'parentID', nodeID);
                        setNodeAttribute(divNodeID1, 'recordStatus', 'update');
                        setNodeAttribute(divNodeID0, 'recordStatus', 'update');
                        displayNodeInfo(divNodeID0);
                        countChild++;
                        
                    } else { // No relation

                        //Check if divNodeID1 was child of divNodeID0
                        //If was, remove child relation
                        var nodeID = document.getElementById(divNodeID0).getAttribute('nodeID');
                        var parentID = document.getElementById(divNodeID1).getAttribute('parentID');
                        if (parentID == nodeID) {
                            setNodeAttribute(divNodeID1, 'parentID', '0');
                            setNodeAttribute(divNodeID1, 'recordStatus', 'update');
                            displayNodeInfo(divNodeID1);
                        }
                    }
                }
            }
        }
        
        //No parents found for this Node
        if (countChild==0) {
            setNodeAttribute(divNodeID0, 'parentID', '0');
            setNodeAttribute(divNodeID0, 'recordStatus', 'update');
            displayNodeInfo(divNodeID0);
        }
    }

    //
    //
    //
    function checkOverlapping(divNodeID0, divNodeID1) {
        "use strict";
        
        var x0, y0, r0, x1, y1, r1;
        var a, dx, dy, d, h, rx, ry;
        var x2, y2;
        var relType = "";
                
        r0 = document.getElementById(divNodeID0).offsetWidth/2;
        x0 = parseInt(document.getElementById(divNodeID0).style.left, 10) + r0;
        y0 = parseInt(document.getElementById(divNodeID0).style.top, 10) + r0;
        
        r1 = document.getElementById(divNodeID1).offsetWidth/2;
        x1 = parseInt(document.getElementById(divNodeID1).style.left, 10) + r1;
        y1 = parseInt(document.getElementById(divNodeID1).style.top, 10) + r1;
        
        //dx and dy are the vertical and horizontal distances between the circle centers.
        dx = x1 - x0;
        dy = y1 - y0;

        // Determine the straight-line distance between the centers.
        d = Math.sqrt((dy*dy) + (dx*dx));

        if (d > r0 + r1) {
            // No overlap
            relType = "no";
            //displayMessage("<br/>" + divNodeID1 + " | NO Overlapping", "append");
            //
        } else if (d <= Math.abs(r0 - r1)) {
            // Inside
            if (r0 > r1)
                relType = "parent";
            else if (r0 < r1)
                relType = "child";
            else
                relType = "brother";
            //
            displayMessage(" ---> Relation: " + relType + " of " + divNodeID1, "append");
            //
        } else { // if (d <= r0 + r1)
            // Overlap
            relType = "overlap";
            //displayMessage("<br/>" + divNodeID1 + " | Overlapping", "append");
            //
        }
        
        return relType;
        
    }

    //
    //
    //
    function openPage(page, divNodeID) {
        "use strict";
        
        var url;
        
        if (page == 'home')
            url = "http://catsoul1.j43.ca/project/index.html";
        else
            url = "http://catsoul1.j43.ca/project/pages/" + page + ".html";
        
        var myWin = window.open(url, "_self", false);
        
        myWin.location = url;
        
    }




