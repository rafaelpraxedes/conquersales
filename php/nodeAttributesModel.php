<?php

    // Connection Info
    $GLOBALS['servername'] = 'sql3.freemysqlhosting.net';
    $GLOBALS['username'] = 'sql3130836';
    $GLOBALS['password'] = '4yvTvmiWps';
    $GLOBALS['dbname'] = 'sql3130836';

    //Object Operation
    class Operation
    {
        public $name;
        public $message;
        public $value;
    }
    $Operation = new Operation();

    $Operation->name = $_POST["operation"];
    $Operation->message = "init";
    $Operation->value = 0;

    $json = $_POST["objAttribute"];
    $arrayAttributes = json_decode($json, true);

    //TEST
    //echo json_encode($arrayAttributes);
    
    //Object Node Attribute
    class Attribute
    {
        public $nodeID;
        public $levelID;
        public $attributeID;
        public $attributeName;
        public $attributeType;
        public $attributeValue;
        public $elementID;
        public $recordStatus;
    }
    $Attribute = new Attribute();
    $Attributes = array($Attribute);

    // Call Main
    main($Operation, $Attribute, $Attributes, $arrayAttributes);

    //
    //
    //
    function main(&$Operation, &$Attribute, &$Attributes, &$arrayAttributes) {
        
        $resultMsg = "";
        
        if ($Operation->name == "queryRows") {
            
            //$Attribute->nodeID = 8;//$arrayAttributes->nodeID;
            queryRows($Operation, $Attribute, $Attributes, $arrayAttributes['nodeID']);
            
            //Remove first element (Null)
            array_shift($Attributes);
            
            //Send Data to Client
            sendData($Operation, $Attributes);
            
        } elseif ($Operation->name == "save") {
            
            $result = saveDB($arrayAttributes);

            //Send back Json Objects with recordStatus updated
            sendSaveResult(json_encode($arrayAttributes));
        }
        
    }

    // Callback
    function sendData(&$Operation, $data) {
        
        $json = json_encode($Operation) . '###OBJECTSEPARATOR###' . json_encode($data);
        
        echo $json;
    }


    //
    //
    //
    function queryRows(&$Operation, &$Attribute, &$Attributes, $filters) {
        
        $servername = $GLOBALS['servername'];
        $username = $GLOBALS['username'];
        $password = $GLOBALS['password'];
        $dbname = $GLOBALS['dbname'];
        
        $resultMsg = "OK";
        
        // Create connection
        $conn = mysqli_connect($servername, $username, $password, $dbname);
        
        // Check connection
        if (!$conn) {
            $resultMsg = "Connection failed: " . mysqli_connect_error();
        } else {

            try {
                
                //$query = " select count(*) from attributes ";
                
                $query  = " SELECT n.nodeID ";
                $query .= "       ,l.levelID ";
                $query .= "       ,l.attributeID ";
                $query .= "       ,t.name as attributeName ";
                $query .= "       ,t.attribute_type as attributeType ";
                $query .= "       ,IF(t.attribute_type = 'Text', a.value_text, IF(t.attribute_type = 'Date', a.value_date, a.value_number)) as attributeValue ";
                $query .= " FROM   nodes            n ";
                $query .= " join   level_attributes l on l.levelID = n.LevelID ";
                $query .= " join   attributes       t on t.attributeID = l.attributeID ";
                $query .= " left join   node_attributes  a on a.nodeID = n.nodeID and a.attributeID = l.attributeID ";
                $query .= " where  n.nodeID = " . $filters; //. $Attribute['nodeID'];
                $query .= " order by l.attributeID ";
                
                $result = mysqli_query($conn, $query) or die(" Query: ($query) Error: " . mysqli_error($conn));
                
                if (!$result) {
                    $resultMsg = "Query failed: ($query) Error: " . mysqli_error($conn);
                } else {
                    
                    //Get Rows and store in array of object
                    while($row = mysqli_fetch_assoc($result)) {

                        $AttributeRow = new $Attribute();

                        $AttributeRow->nodeID           = $row[ 'nodeID' ];  
                        $AttributeRow->levelID          = $row[ 'levelID' ];
                        $AttributeRow->attributeID      = $row[ 'attributeID' ];  
                        $AttributeRow->attributeName    = $row[ 'attributeName' ];
                        $AttributeRow->attributeType    = $row[ 'attributeType' ];
                        
                        if ($AttributeRow->attributeType == 'Date')
                            $AttributeRow->attributeValue = DATE($row[ 'attributeValue' ]);
                        else
                            $AttributeRow->attributeValue = $row[ 'attributeValue' ];

                        array_push( $Attributes, $AttributeRow );
                    }
                    
                }

                mysqli_close($conn);
                
            } catch(Exception $e) {
                mysqli_close($conn);
                $resultMsg = "Operation failed: " . $e->getMessage();
            }
        }
        
        $Operation->message = $resultMsg;

    }//

    //
    //
    //
    function saveDB(&$arrayAttributes) {
        
        $servername = $GLOBALS['servername'];
        $username = $GLOBALS['username'];
        $password = $GLOBALS['password'];
        $dbname = $GLOBALS['dbname'];
        
        $resultMsg = "OK";
        
        // Create connection
        $conn = mysqli_connect($servername, $username, $password, $dbname);
        
        // Check connection
        if (!$conn) {
            $resultMsg = "Connection failed: " . mysqli_connect_error();
        } else {

            try {
                
                $updateText = " UPDATE node_attributes set value_text = ?   WHERE nodeID = ? AND attributeID = ? " ;
                $updateDate = " UPDATE node_attributes set value_date = ?   WHERE nodeID = ? AND attributeID = ? " ;
                $updateNumb = " UPDATE node_attributes set value_number = ? WHERE nodeID = ? AND attributeID = ? " ;
                
                $bindText = 'sii';
                $bindDate = 'dii';
                $bindNumb = 'iii';
                
                $insertText = " INSERT INTO node_attributes (value_text, nodeID, attributeID) VALUES (?, ?, ?) " ;
                $insertDate = " INSERT INTO node_attributes (value_date, nodeID, attributeID) VALUES (?, ?, ?) " ;
                $insertNumb = " INSERT INTO node_attributes (value_number, nodeID, attributeID) VALUES (?, ?, ?) " ;
                
                $count = 0;
                foreach($arrayAttributes as &$objAttribute) {

                    if ($objAttribute['recordStatus'] == 'update') {
                        
                        if ($objAttribute['attributeType'] == 'Text') {
                            $update = $updateText;
                            $bindSel = $bindText;
                            $insert = $insertText;
                            $attributeValue = $objAttribute['attributeValue'];
                        } elseif ($objAttribute['attributeType'] == 'Date') {
                            $update = $updateDate;
                            $bindSel = $bindDate;
                            $insert = $insertDate;
                            
                            $attributeValue = date('Y-m-d', strtotime($objAttribute['attributeValue']));
                            
                        } elseif ($objAttribute['attributeType'] == 'Number') {
                            $update = $updateNumb;
                            $bindSel = $bindNumb;
                            $insert = $insertNumb;
                            $attributeValue = $objAttribute['attributeValue'];
                        }

                        // UPDATE
                        $stmtUpdate = $conn->prepare($update);
                        $stmtUpdate->bind_param($bindSel,
                                                $attributeValue,
                                                $objAttribute['nodeID'],
                                                $objAttribute['attributeID']);
                        $stmtUpdate->execute();
                        $rowsAffected = $stmtUpdate->affected_rows;
                        $stmtError = mysqli_stmt_error($stmtUpdate);
                        $stmtUpdate->close();

                        if ($rowsAffected > 0) {
                            $objAttribute['recordStatus'] = "updated";
                        }
                        else {
                            
                            // INSERT
                            $stmtInsert = $conn->prepare($insert);
                            $stmtInsert->bind_param($bindSel,
                                                    $attributeValue,
                                                    $objAttribute['nodeID'],
                                                    $objAttribute['attributeID']);
                            $stmtInsert->execute();
                            $rowsAffected = $stmtInsert->affected_rows;
                            $stmtError = mysqli_stmt_error($stmtInsert);
                            $stmtInsert->close();
                            $objAttribute['recordStatus'] = "updated";
                        }
                    }
                    
                    $count = $count + 1;
                }
                
                $conn->close();
                
            } catch(Exception $e) {
                mysqli_close($conn);
                $resultMsg = "Operation failed: " . $e->getMessage();
            }
        }
        
        return $resultMsg;

    } //

    // Callback
    function sendSaveResult($datafromServer) {
        echo $datafromServer;
    }

?>  




