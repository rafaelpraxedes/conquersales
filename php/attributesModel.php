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
        public $description;
        public $attribute_type;
        public $default_value;
        public $list_values;
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
            
        } elseif ($Operation->name == "getLastID") {
            
            getLastID($Operation);
            
            //Send Data to Client
            sendData($Operation, $Attributes);
            
        } elseif ($Operation->name == "insert") {
            
            $result = insertDB($arrayAttributes);

            //Send back Json Objects with recordStatus updated
            sendInsertResult(json_encode($arrayAttributes));
            
        } elseif ($Operation->name == "update") {
            
            $result = updateDB($arrayAttributes);

            //Send back Json Objects with recordStatus updated
            sendUpdateResult(json_encode($arrayAttributes));
            
        } elseif ($Operation->name == "delete") {
            
            $result = deleteDB($arrayAttributes);

            //Send back Json Objects with recordStatus updated
            sendDeleteResult(json_encode($arrayAttributes));        
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
                
                $query = "select max(attributeID) from attributes";
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
                
                $query  = " select attributeID, name, description, attribute_type, default_value, list_values";
                $query .= " from attributes order by attributeID ";
                $result = mysqli_query($conn, $query); //or die(" Query: ($query) Error: " . mysqli_error($conn));
                
                if (!$result) {
                    $resultMsg = "Query failed: ($query) Error: " . mysqli_error($conn);
                } else {
                    
                    //Get Rows and store in array of object
                    while($row = mysqli_fetch_assoc($result)) {

                        $AttributeRow = new $Attribute();

                        $AttributeRow->attributeID       = $row[ 'attributeID' ];  
                        $AttributeRow->name              = $row[ 'name' ];
                        $AttributeRow->description       = $row[ 'description' ];  
                        $AttributeRow->attribute_type    = $row[ 'attribute_type' ];
                        $AttributeRow->default_value     = $row[ 'default_value' ];
                        $AttributeRow->list_values       = $row[ 'list_values' ];

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
    function insertDB(&$arrayAttributes) {
        
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
                
                $sql  = "INSERT INTO attributes ( attributeID, name, description, attribute_type, default_value, list_values ) " ;
                $sql .= "VALUES ( ?, ?, ?, ?, ?, ? ) " ;

                if($statement = $conn->prepare($sql)){
                    
                    $count = 0;
                    
                    foreach($arrayAttributes as &$objAttribute) {
                        
                        if ($objAttribute['recordStatus'] == 'new') {
                            
                            //Executes INSERT
                            $statement->bind_param('isssss',
                                                    $objAttribute['attributeID'],
                                                    $objAttribute['name'],
                                                    $objAttribute['description'], 
                                                    $objAttribute['attribute_type'],
                                                    $objAttribute['default_value'], 
                                                    $objAttribute['list_values']
                                                  );

                            $statement->execute();
                            $stmtError = mysqli_stmt_error($statement);
                            
                            if ($stmtError == "")
                                $objAttribute['recordStatus'] = "inserted";
                            else
                                $objAttribute['recordStatus'] = $stmtError;
                            
                            $count = $count + 1;
                            //$resultMsg = $resultMsg . $count . " attributeID: " . $objAttribute['attributeID'] . " Err: " . $stmtError . "\r\n";
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
    function updateDB(&$arrayAttributes) {
        
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
                
                $sql  = " UPDATE attributes set " .
                        "        name = ? " .
                        "       ,description = ? " .
                        "       ,attribute_type = ? " .
                        "       ,default_value = ? " . 
                        "       ,list_values = ? " . 
                        " WHERE attributeID = ? " ;

                if($stmt = $conn->prepare($sql)) {
                    
                    $count = 0;
                    
                    foreach($arrayAttributes as &$objAttribute) {
                        
                        if ($objAttribute['recordStatus'] == 'update') {
                                
                            $parentID = $objAttribute['parentID'];
                            if ($parentID == 0)
                                $parentID = null;
                            
                            //Execute UPDATE
                            $stmt->bind_param('sssssi',
                                                $objAttribute['name'], 
                                                $objAttribute['description'], 
                                                $objAttribute['attribute_type'], 
                                                $objAttribute['default_value'],
                                                $objAttribute['list_values'],
                                                $objAttribute['attributeID']);

                            $stmt->execute();
                            $stmtError = mysqli_stmt_error($stmt);
                            
                            if ($stmtError == "")
                                $objAttribute['recordStatus'] = "updated";
                            else
                                $objAttribute['recordStatus'] = $stmtError;
                            
                            $count = $count + 1;
                            //$resultMsg = $resultMsg . $count . " attributeID: " . $objAttribute['attributeID'] . " Err: " . $stmtError . "\r\n";
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
    function deleteDB(&$arrayAttributes) {
        
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
                
                $delete  = "DELETE FROM attributes WHERE attributeID = ? " ;

                if($stmtDelete = $conn->prepare($delete)){
                    
                    $count = 0;
                    
                    foreach($arrayAttributes as &$objAttribute) {
                        
                        if ($objAttribute['recordStatus'] == 'delete') {
                            
                            //Execute DELETE
                            $stmtDelete->bind_param('i', $objAttribute['attributeID']);

                            $stmtDelete->execute();
                            $stmtError = mysqli_stmt_error($stmtDelete);
                            
                            if ($stmtError == "")
                                $objAttribute['recordStatus'] = "deleted";
                            else
                                $objAttribute['recordStatus'] = $stmtError;
                            
                            $count = $count + 1;
                            //$resultMsg = $resultMsg . $count . " attributeID: " . $objAttribute['attributeID'] . " Err: " . $stmtError . "\r\n";
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




