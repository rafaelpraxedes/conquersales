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
    $arrayNodes = json_decode($json, true);

    //TEST
    //echo json_encode($arrayAttributes);
    
    //Object Nodes
    class Node
    {
        public $nodeID;
        public $name;
        public $xPos;
        public $yPos;
        public $zIndex;
        public $width;
        public $height;
        public $class;
        public $style;
        public $parentID;
        public $levelID;
    }
    $Node = new Node();
    $Nodes = array($Node);

    // Call Main
    main($Operation, $Node, $Nodes, $arrayNodes);

    //
    //
    //
    function main(&$Operation, &$Node, &$Nodes, &$arrayNodes) {
        
        $resultMsg = "";
        
        if ($Operation->name == "queryRows") {
            
            queryRows($Operation, $Node, $Nodes, '');
            //Remove first element (Null)
            array_shift($Nodes);
            
            //Send Data to Client
            sendData($Operation, $Nodes);
            
        }
        elseif ($Operation->name == "getLastID") {
            
            getLastID($Operation);
            
            //Send Data to Client
            sendData($Operation, $Nodes);
        }
        elseif ($Operation->name == "insert") {
            
            $result = insertDB($arrayNodes);

            //Send back Json Objects with recordStatus updated
            sendInsertResult (json_encode($arrayNodes));
            
        } elseif ($Operation->name == "update") {
            
            $result = updateDB($arrayNodes);

            //Send back Json Objects with recordStatus updated
            sendUpdateResult(json_encode($arrayNodes));
            
        } elseif ($Operation->name == "delete") {
            
            $result = deleteDB($arrayNodes);

            //Send back Json Objects with recordStatus updated
            sendDeleteResult(json_encode($arrayNodes));
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
    function getLastID(&$Operation) {
        
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
                
                $query = "select max(nodeID) from nodes";
                $result = mysqli_query($conn, $query); //or die(" Query: ($query) Error: " . mysqli_error($conn));
                
                if (!$result) {
                    $resultMsg = "Query failed: ($query) Error: " . mysqli_error($conn);
                } else {
                    
                    $fields = mysqli_num_fields($result);
                    $row = mysqli_fetch_row($result);
                    $Operation->value = $row[0];
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
    function queryRows(&$Operation, &$Node, &$Nodes, $filters) {
        
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
                
                $query  = " select nodeID, name, xPos, yPos, zIndex, width, height, class, style, parentID, levelID ";
                $query .= " from nodes order by nodeID ";
                $result = mysqli_query($conn, $query); //or die(" Query: ($query) Error: " . mysqli_error($conn));
                
                if (!$result) {
                    $resultMsg = "Query failed: ($query) Error: " . mysqli_error($conn);
                } else {
                    
                    //Get Rows and store in array of object
                    while($row = mysqli_fetch_assoc($result)) {

                        $NodeRow = new Node();

                        $NodeRow->nodeID    = $row[ 'nodeID' ];  
                        $NodeRow->name      = $row[ 'name' ];
                        $NodeRow->xPos      = $row[ 'xPos' ];  
                        $NodeRow->yPos      = $row[ 'yPos' ];
                        $NodeRow->zIndex    = $row[ 'zIndex' ];
                        $NodeRow->width     = $row[ 'width' ];
                        $NodeRow->height    = $row[ 'height' ];
                        $NodeRow->class     = $row[ 'class' ];
                        $NodeRow->style     = $row[ 'style' ];
                        $NodeRow->parentID  = $row[ 'parentID' ];
                        $NodeRow->levelID   = $row[ 'levelID' ];

                        array_push( $Nodes, $NodeRow );
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
    function insertDB(&$arrayNodes) {
        
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
                
                $sql  = "INSERT INTO nodes ( nodeID, name, xPos, yPos, zIndex, width, height, class, style, levelID, parentID ) " ;
                $sql .= "VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) " ;

                if($statement = $conn->prepare($sql)){
                    
                    $count = 0;
                    
                    foreach($arrayNodes as &$objNode) {
                        
                        if ($objNode['recordStatus'] == 'new') {
                            
                            $parentID = $objNode['parentID'];
                            if ($parentID == 0)
                                $parentID = null;
                            
                            //Executes INSERT
                            $statement->bind_param('isiiiiissii',
                                                    $objNode['nodeID'],
                                                    $objNode['name'],
                                                    $objNode['xPos'], 
                                                    $objNode['yPos'],
                                                    $objNode['zIndex'], 
                                                    $objNode['width'], 
                                                    $objNode['height'],
                                                    $objNode['class'],
                                                    $objNode['style'], 
                                                    $objNode['levelID'],
                                                    $parentID
                                                  );

                            $statement->execute();
                            $stmtError = mysqli_stmt_error($statement);
                            
                            if ($stmtError == "")
                                $objNode['recordStatus'] = "insert";
                            else
                                $objNode['recordStatus'] = $stmtError;
                            
                            $count = $count + 1;
                            //$resultMsg = $resultMsg . $count . " nodeID: " . $objNode['nodeID'] . " Err: " . $stmtError . "\r\n";
                        }
                    }
                    
                    $statement->close();

                } else 
                    echo "Prepare failed: (" . $conn->errno . ") " . $conn->error;

                $conn->close();
                
            } catch(Exception $e) {
                mysqli_close($conn);
                $resultMsg = "Operation failed: " . $e->getMessage();
            }
        }
        
        return $resultMsg;

    }//

    // Callback
    function sendInsertResult($datafromServer) {
        echo $datafromServer;
    }

    //
    //
    //
    function updateDB(&$arrayNodes) {
        
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
                
                $sql  = " UPDATE nodes set " .
                        "        xPos = ? " .
                        "       ,yPos = ? " .
                        "       ,zIndex = ? " .
                        "       ,width = ? " . 
                        "       ,height = ? " . 
                        "       ,class = ? " .
                        "       ,style = ? " .
                        "       ,parentID = ? " .
                        //"       ,levelID = ? " .
                        " WHERE nodeID = ? " ;

                if($stmt = $conn->prepare($sql)){
                    
                    $count = 0;
                    
                    foreach($arrayNodes as &$objNode) {
                        
                        if ($objNode['recordStatus'] == 'update') {
                                
                            $parentID = $objNode['parentID'];
                            if ($parentID == 0)
                                $parentID = null;
                            
                            //Execute UPDATE
                            $stmt->bind_param('iiiiissii',
                                                $objNode['xPos'], 
                                                $objNode['yPos'],
                                                $objNode['zIndex'], 
                                                $objNode['width'], 
                                                $objNode['height'],
                                                $objNode['class'],
                                                $objNode['style'], 
                                                //$objNode['levelID'],
                                                $parentID,
                                                $objNode['nodeID']);

                            $stmt->execute();
                            $stmtError = mysqli_stmt_error($stmt);
                            
                            if ($stmtError == "")
                                $objNode['recordStatus'] = "updated";
                            else
                                $objNode['recordStatus'] = $stmtError;
                            
                            $count = $count + 1;
                            //$resultMsg = $resultMsg . $count . " nodeID: " . $objNode['nodeID'] . " Err: " . $stmtError . "\r\n";
                        }
                    }
                    
                    $stmt->close();

                } else 
                    echo "Prepare failed: (" . $conn->errno . ") " . $conn->error;

                $conn->close();
                
            } catch(Exception $e) {
                mysqli_close($conn);
                $resultMsg = "Operation failed: " . $e->getMessage();
            }
        }
        
        return $resultMsg;

    }//

    // Callback
    function sendUpdateResult($datafromServer) {
        echo $datafromServer;
    }

    //
    //
    //
    function deleteDB(&$arrayNodes) {
        
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
                
                $update  = "UPDATE nodes set parentID = null where parentID = ? " ;
                
                $delete  = "DELETE FROM nodes where nodeID = ? " ;

                if($stmtDelete = $conn->prepare($delete)){
                    
                    $count = 0;
                    
                    foreach($arrayNodes as &$objNode) {
                        
                        if ($objNode['recordStatus'] == 'delete') {
                            
                            //First remove references of parentID
                            $stmtUpdate = $conn->prepare($update);
                            $stmtUpdate->bind_param('i', $objNode['nodeID']);
                            $stmtUpdate->execute();
                            $stmtError = mysqli_stmt_error($stmtUpdate);
                                
                            //Execute DELETE
                            $stmtDelete->bind_param('i', $objNode['nodeID']);

                            $stmtDelete->execute();
                            $stmtError = mysqli_stmt_error($stmtDelete);
                            
                            if ($stmtError == "")
                                $objNode['recordStatus'] = "deleted";
                            else
                                $objNode['recordStatus'] = $stmtError;
                            
                            $count = $count + 1;
                            //$resultMsg = $resultMsg . $count . " nodeID: " . $objNode['nodeID'] . " Err: " . $stmtError . "\r\n";
                        }
                    }
                    
                    $stmtDelete->close();

                } else 
                    echo "Prepare failed: (" . $conn->errno . ") " . $conn->error;

                $conn->close();
                
            } catch(Exception $e) {
                mysqli_close($conn);
                $resultMsg = "Operation failed: " . $e->getMessage();
            }
        }
        
        return $resultMsg;

    }//

    // Callback
    function sendDeleteResult($datafromServer) {
        echo $datafromServer;
    }
?>  




