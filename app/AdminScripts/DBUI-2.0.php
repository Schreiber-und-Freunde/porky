<?php
	// DBUI - DataBase User Interface v2.0.0.0
	// © 2009-2014 Dipl.-Ing. (FH) Oliver Grünberg, Schreiber & Freunde GmbH, www.schreiber-freunde.de

	// Inspiration:
	// http://www.php.net/manual/en/sockets.examples.php
	// http://www.if-not-true-then-false.com/2012/php-pdo-sqlite3-example/
	// http://www.ibm.com/developerworks/xml/library/x-javascriptdataaccess/index.html?ca=dat

	error_reporting(E_ALL);

	// Allow the script to hang around waiting for connections.
	set_time_limit(0);

	// Turn on implicit output flushing so we see what we're getting as it comes in
	ob_implicit_flush();




	// *** Socket server
	$address = '127.0.0.1';
	$port = 6789;



	echo " ██▓███   ▒█████   ██▀███   ██ ▄█▀▓██   ██▓\n".
		"▓██░  ██▒▒██▒  ██▒▓██ ▒ ██▒ ██▄█▒  ▒██  ██▒\n".
		"▓██░ ██▓▒▒██░  ██▒▓██ ░▄█ ▒▓███▄░   ▒██ ██░\n".
		"▒██▄█▓▒ ▒▒██   ██░▒██▀▀█▄  ▓██ █▄   ░ ▐██▓░\n".
		"▒██▒ ░  ░░ ████▓▒░░██▓ ▒██▒▒██▒ █▄  ░ ██▒▓░\n".
		"▒▓▒░ ░  ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░▒ ▒▒ ▓▒   ██▒▒▒ \n".
		"░▒ ░       ░ ▒ ▒░   ░▒ ░ ▒░░ ░▒ ▒░ ▓██ ░▒░ \n".
		"░░       ░ ░ ░ ▒    ░░   ░ ░ ░░ ░  ▒ ▒ ░░  \n".
		"             ░ ░     ░     ░  ░    ░ ░     \n".
		"                                   ░ ░     \n";



	echo "\n(c)2009–2014 DBUI - DataBase User Interface\n\n";

	if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
		echo "socket_create() failed, reason: " . socket_strerror(socket_last_error()) . "\n";
		echo "\nquitting DBUI...\n\n";
		exit(0);
	}

	if (!socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1)) { 
		echo "### Reusing socket: ".socket_strerror(socket_last_error($sock)."###"); 
		//exit; 
	}

	if (socket_bind($sock, $address, $port) === false) {
		echo "socket_bind() failed, reason: " . socket_strerror(socket_last_error($sock)) . "\n";
		echo "\nquitting DBUI...\n\n";
		exit(0);
	}

	if (socket_listen($sock, 5) === false) {
		echo "socket_listen() failed, reason: " . socket_strerror(socket_last_error($sock)) . "\n";
		echo "\nquitting DBUI...\n\n";
		exit(0);
	}



	do {
		if (($msgsock = socket_accept($sock)) === false) {
			echo "socket_accept() failed, reason: " . socket_strerror(socket_last_error($sock)) . "\n";
			break;
		}

		// read socket
		$buf = socket_read($msgsock, 1048576, PHP_NORMAL_READ);

		// check GET
		$buf = explode(" ", $buf);
		// var_dump($buf);

		// clean up / after GET
		$buf[1] = ltrim($buf[1], "/");

		//echo "\nbase64 encoded GET: ".$buf[1];
		$bufUTF8 = base64_decode($buf[1]);

		if($bufUTF8 == "quit DBUI" || $bufUTF8 == "quit DBUI\n"){
			echo "\nquitting DBUI...\n\n";
			break;
		}

		// For testing purposes use this working JSON string
		// $bufUTF8 = '{"DBUI":{"sqlDatabaseType":"SQLite","sqlServerAddress":"127.0.0.1","sqlDatabaseName":"testdb.sqlite3","sqlUsername":"Oliver","sqlPassword":"1234","sqlStatement":"SELECT * FROM messages"}}';

		echo "\nbase64 decoded GET: ".$bufUTF8."\n";

		// Convert GET request to JSON
		$getRequestJSON = json_decode($bufUTF8, true);

		// Extract values from JSON and fill variables
		$sqlDatabaseType = $getRequestJSON["DBUI"]["sqlDatabaseType"];
		$sqlServerAddress = $getRequestJSON["DBUI"]["sqlServerAddress"];
		$sqlDatabaseName = $getRequestJSON["DBUI"]["sqlDatabaseName"];
		$sqlUsername = $getRequestJSON["DBUI"]["sqlUsername"];
		$sqlPassword = $getRequestJSON["DBUI"]["sqlPassword"];
		$sqlStatement = $getRequestJSON["DBUI"]["sqlStatement"];

		// *** Request database via PHP PDO
		$resultAll = requestDatabase($sqlDatabaseType, $sqlServerAddress, $sqlDatabaseName, $sqlUsername, $sqlPassword, $sqlStatement);

		$resultAllJSON = json_encode($resultAll, JSON_UNESCAPED_UNICODE);

		echo "\nJSON result: ".$resultAllJSON."\n******************************************\n";



		// write socket Base64 encoded
		$resultAllJSONBase64 = base64_encode($resultAllJSON);
		$msg = "\n$resultAllJSONBase64\n";
		socket_write($msgsock, $msg, strlen($msg));


		// closing socket after first reply!
		socket_close($msgsock);
	} while (true);

	socket_close($sock);





	// *** Database connection via PHP PDO
	function requestDatabase($sqlDatabaseType, $sqlServerAddress, $sqlDatabaseName, $sqlUsername, $sqlPassword, $sqlStatement){

		try {

			if($sqlDatabaseType == "SQLite"){
				// Create (connect to) SQLite database in file
				$fileDB = new PDO("sqlite:".$sqlDatabaseName);
				// Set errormode to exceptions
				$fileDB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$result = $fileDB->query($sqlStatement);
				$resultAll = $result->fetchAll(PDO::FETCH_ASSOC);

				// Close file db connection
				$fileDB = null;

				// return result as array
				return $resultAll;

			}

			if($sqlDatabaseType == "MySQL"){
				echo "\nsql database type [".$sqlDatabaseType."] is not yet supported.\n";
			}

			if($sqlDatabaseType != "SQLite" && $sqlDatabaseType != "MySQL"){
				echo "\nsql database type [".$sqlDatabaseType."] is not supported.\n";
			}
		}catch(PDOException $e) {
			// Print PDOException message
			echo $e->getMessage();
		}

	}






?>