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
    
    //Object Attribute
    class Attribute
    {
        public $attributeID;
        public $name;
        public $level1;
        public $level2;
        public $level3;
        public $level4;
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
            
            queryRows($Operation, $Attribute, $Attributes, '');
            
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
                
                $query  = " select a.attributeID, a.name ";
                $query .= "    ,(select count(*) from level_attributes as l where a.attributeID = l.attributeID and l.levelID = 1) level1 ";
                $query .= "    ,(select count(*) from level_attributes as l where a.attributeID = l.attributeID and l.levelID = 2) level2 ";
                $query .= "    ,(select count(*) from level_attributes as l where a.attributeID = l.attributeID and l.levelID = 3) level3 ";
                $query .= "    ,(select count(*) from level_attributes as l where a.attributeID = l.attributeID and l.levelID = 4) level4 ";
                $query .= " from   attributes as a ";
                $query .= " order by a.attributeID ";            
                
                $result = mysqli_query($conn, $query); //or die(" Query: ($query) Error: " . mysqli_error($conn));
                
                if (!$result) {
                    $resultMsg = "Query failed: ($query) Error: " . mysqli_error($conn);
                } else {
                    
                    //Get Rows and store in array of object
                    while($row = mysqli_fetch_assoc($result)) {

                        $AttributeRow = new $Attribute();

                        $AttributeRow->attributeID  = $row[ 'attributeID' ];  
                        $AttributeRow->name         = $row[ 'name' ];
                        $AttributeRow->level1       = $row[ 'level1' ];  
                        $AttributeRow->level2       = $row[ 'level2' ];
                        $AttributeRow->level3       = $row[ 'level3' ];
                        $AttributeRow->level4       = $row[ 'level4' ];

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
                
                $insert  = " INSERT INTO level_attributes (attributeID, levelID) VALUES (?, ?) " ;
                $delete  = " DELETE FROM level_attributes WHERE attributeID = ? AND levelID = ? " ;

                $stmtInsert = $conn->prepare($insert);
                $stmtDelete = $conn->prepare($delete);
                
                $count = 0;
                foreach($arrayAttributes as &$objAttribute) {

                    if ($objAttribute['recordStatus'] == 'update') {

                        for ($i = 1; $i <= 4; $i++) {

                            $currLevelID = $i;
                            $currLevelName = 'level' . $i;
                        
                            //Query if relation attributeID x levelID exists in DB
                            $select  = " SELECT count(*) FROM level_attributes ";
                            $select .= " WHERE attributeID = " . $objAttribute['attributeID'] . " AND levelID = " . $currLevelID;
                            $result = mysqli_query($conn, $select);
                            $fields = mysqli_num_fields($result);
                            $row = mysqli_fetch_row($result);
                            $checkDB = $row[0];
                            
                             $objAttribute['rowID'] = $row[0];
                
                            if ($objAttribute[$currLevelName] == 1 && $checkDB == 0) {

                                // INSERT
                                $stmtInsert->bind_param('ii', $objAttribute['attributeID'], $currLevelID);
                                $stmtInsert->execute();
                                $stmtError = mysqli_stmt_error($stmtInsert);

                                if ($stmtError == "")
                                    $objAttribute['recordStatus'] = "inserted";
                                else
                                    $objAttribute['recordStatus'] = $stmtError;

                            } elseif ($objAttribute[$currLevelName] == 0 && $checkDB == 1) {

                                // DELETE
                                $stmtDelete->bind_param('ii', $objAttribute['attributeID'], $currLevelID);
                                $stmtDelete->execute();
                                $stmtError = mysqli_stmt_error($stmtDelete);
                                
                                if ($stmtError == "")
                                    $objAttribute['recordStatus'] = "deleted";
                                else
                                    $objAttribute['recordStatus'] = $stmtError;
                            }
                        }
                    }

                    $count = $count + 1;
                    //$resultMsg = $resultMsg . $count . " attributeID: " . $objAttribute['attributeID'] . " Err: " . $stmtError . "\r\n";
                }
                
                $stmtInsert->close();
                $stmtDelete->close();

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




