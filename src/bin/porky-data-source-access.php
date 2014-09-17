<?php
/*
	Start porky data source access
	via commandline
	php porky-db-access.php

	Quit porky data source access
	via web browser
	http://127.0.0.1:6789/cXVpdCBwb3JreQo=

	via command line
	Get base64 encoded string
	echo 'quit porky' | openssl base64
	curl 127.0.0.1:6789/cXVpdCBwb3JreQo=


	Inspiration
	http://www.php.net/manual/en/sockets.examples.php
	http://www.if-not-true-then-false.com/2012/php-pdo-sqlite3-example/
	http://www.ibm.com/developerworks/xml/library/x-javascriptdataaccess/index.html?ca=dat
*/


	error_reporting(E_ALL);

	// Allow the script to hang around waiting for connections.
	set_time_limit(0);

	// Turn on implicit output flushing so we see what we're getting as it comes in
	ob_implicit_flush();




	// *** Socket server
	$address = '127.0.0.1';
	$port = 6789;



	echo "\n ██▓███   ▒█████   ██▀███   ██ ▄█▀▓██   ██▓\n".
		"▓██░  ██▒▒██▒  ██▒▓██ ▒ ██▒ ██▄█▒  ▒██  ██▒\n".
		"▓██░ ██▓▒▒██░  ██▒▓██ ░▄█ ▒▓███▄░   ▒██ ██░\n".
		"▒██▄█▓▒ ▒▒██   ██░▒██▀▀█▄  ▓██ █▄   ░ ▐██▓░\n".
		"▒██▒ ░  ░░ ████▓▒░░██▓ ▒██▒▒██▒ █▄  ░ ██▒▓░\n".
		"▒▓▒░ ░  ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░▒ ▒▒ ▓▒   ██▒▒▒ \n".
		"░▒ ░       ░ ▒ ▒░   ░▒ ░ ▒░░ ░▒ ▒░ ▓██ ░▒░ \n".
		"░░       ░ ░ ░ ▒    ░░   ░ ░ ░░ ░  ▒ ▒ ░░  \n".
		"             ░ ░     ░     ░  ░    ░ ░     \n".
		"                                   ░ ░     \n";



	echo "\nporky data source access interface\n\n";

	if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
		echo "socket_create() failed, reason: " . socket_strerror(socket_last_error()) . "\n";
		echo "\nquitting interface...\n\n";
		exit(0);
	}

	if (!socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1)) { 
		echo "### Reusing socket: ".socket_strerror(socket_last_error($sock)."###"); 
		//exit; 
	}

	if (socket_bind($sock, $address, $port) === false) {
		echo "socket_bind() failed, reason: " . socket_strerror(socket_last_error($sock)) . "\n";
		echo "\nquitting interface...\n\n";
		exit(0);
	}

	if (socket_listen($sock, 5) === false) {
		echo "socket_listen() failed, reason: " . socket_strerror(socket_last_error($sock)) . "\n";
		echo "\nquitting interface...\n\n";
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

		if($bufUTF8 == "quit porky" || $bufUTF8 == "quit porky\n"){
			echo "\nquitting interface...\n\n";
			break;
		}

		// For testing purposes use this working JSON string
		// $bufUTF8 = '{"porky":{"dataSourceType":"SQLite","dataSourceServer":"127.0.0.1","dataSourceName":"testdb.sqlite3","dataSourceUsername":"Oliver","dataSourcePassword":"1234","dataSourceQuery":"SELECT * FROM messages"}}';

		echo "\nbase64 decoded GET: ".$bufUTF8."\n";

		// Convert GET request to JSON
		$getRequestJSON = json_decode($bufUTF8, true);

		// Extract values from JSON and fill variables
		$dataSourceType = $getRequestJSON["porky"]["dataSourceType"];
		$dataSourceServer = $getRequestJSON["porky"]["dataSourceServer"];
		$dataSourceName = $getRequestJSON["porky"]["dataSourceName"];
		$dataSourceUsername = $getRequestJSON["porky"]["dataSourceUsername"];
		$dataSourcePassword = $getRequestJSON["porky"]["dataSourcePassword"];
		$dataSourceQuery = $getRequestJSON["porky"]["dataSourceQuery"];

		// *** Request data source
		$resultAll = requestDataSource($dataSourceType, $dataSourceServer, $dataSourceName, $dataSourceUsername, $dataSourcePassword, $dataSourceQuery);
		/*
			echo "\n-------------------------\n";
			echo var_dump( $resultAll );
			echo "\n-------------------------\n";
		*/
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





	// *** Requesting data sources
	function requestDataSource($dataSourceType, $dataSourceServer, $dataSourceName, $dataSourceUsername, $dataSourcePassword, $dataSourceQuery){

		try {

			if($dataSourceType == "SQLite"){
				// Create (connect to) SQLite database in file
				$fileDB = new PDO("sqlite:".$dataSourceName);
				// Set errormode to exceptions
				$fileDB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$result = $fileDB->query($dataSourceQuery);
				$resultAll = $result->fetchAll(PDO::FETCH_ASSOC);

				// Close file db connection
				$fileDB = null;

				// return result as array
				return $resultAll;

			}

			if($dataSourceType == "XML"){
				$fileContents = file_get_contents($dataSourceName);
				$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
				$fileContents = trim(str_replace('"', "'", $fileContents));

				$simpleXML = simplexml_load_string($fileContents, null, LIBXML_NOCDATA);
				$resultAll = $simpleXML->xpath($dataSourceQuery);

				// return result as array
				return $resultAll;
			}

			if($dataSourceType == "MySQL"){
				echo "\ndataSourceType [".$dataSourceType."] is not yet supported.\n";
			}

			if($dataSourceType != "SQLite" && $dataSourceType != "MySQL" && $dataSourceType != "XML"){
				echo "\ndataSourceType [".$dataSourceType."] is not supported.\n";
			}
		}catch(PDOException $e) {
			// Print PDOException message
			echo $e->getMessage();
		}

	}






?>