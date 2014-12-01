<?php
/*
	start porky data source access
	via command line on OS-X
	php porky-db-access.php

	quit porky data source access
	via web browser
	http://127.0.0.1:6789/cXVpdCBwb3JreQo=

	via command line on OS-X
	Get base64 encoded string
	echo 'quit porky' | openssl base64
	curl 127.0.0.1:6789/cXVpdCBwb3JreQo=


	inspiration
	http://www.php.net/manual/en/sockets.examples.php
	http://www.if-not-true-then-false.com/2012/php-pdo-sqlite3-example/
	http://www.ibm.com/developerworks/xml/library/x-javascriptdataaccess/index.html?ca=dat
	http://stackoverflow.com/questions/23062537/how-to-convert-html-to-json-using-php
*/
	error_reporting(E_ALL);

	// allow the script to hang around waiting for connections.
	set_time_limit(0);

	// turn on implicit output flushing so we see what we're getting as it comes in
	ob_implicit_flush();




	// socket server
	$address = '127.0.0.1';
	$port = 6789;

	echo "\n**********************************\nporky data source access interface\n**********************************\n\nlistening on ".$address.":".$port."\n\n";

	if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
		echo "socket_create() failed, reason: " . socket_strerror(socket_last_error()) . "\n";
		echo "\nquitting interface...\n\n";
		exit(0);
	}

	if (!socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1)) { 
		echo "### Reusing socket: ".socket_strerror(socket_last_error($sock)."###"); 
		// exit; 
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

		// echo "\nbase64 encoded GET: ".$buf[1];
		$bufUTF8 = base64_decode($buf[1]);

		if($bufUTF8 == "quit porky" || $bufUTF8 == "quit porky\n"){
			echo "\nquitting interface...\n\n";
			break;
		}

		// for testing purposes use this working JSON string
		// $bufUTF8 = '{"porky":{"dataSourceType":"SQLite","dataSourceServer":"127.0.0.1","dataSourceName":"testdb.sqlite3","dataSourceUsername":"Oliver","dataSourcePassword":"1234","dataSourceQuery":"SELECT * FROM messages"}}';

		echo "\nbase64 decoded GET: ".$bufUTF8."\n";

		// convert GET request to JSON
		$getRequestJSON = json_decode($bufUTF8, true);

		// extract values from JSON and fill variables
		$dataSourceType = $getRequestJSON["porky"]["dataSourceType"];
		$dataSourceServer = $getRequestJSON["porky"]["dataSourceServer"];
		$dataSourceName = $getRequestJSON["porky"]["dataSourceName"];
		$dataSourceUsername = $getRequestJSON["porky"]["dataSourceUsername"];
		$dataSourcePassword = $getRequestJSON["porky"]["dataSourcePassword"];
		$dataSourceQuery = $getRequestJSON["porky"]["dataSourceQuery"];

		// request data source
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





	// requesting data sources
	function requestDataSource($dataSourceType, $dataSourceServer, $dataSourceName, $dataSourceUsername, $dataSourcePassword, $dataSourceQuery){

		try {

			if($dataSourceType == "SQLite" || $dataSourceType == "MySQL"){
				if($dataSourceType == "SQLite"){
					// create (connect to) SQLite database file
					$db = new PDO("sqlite:".$dataSourceName);
				}elseif($dataSourceType == "MySQL"){
					// create MySQL server connection
					$db = new PDO("mysql:host=".$dataSourceServer."; dbname=".$dataSourceName."; charset=utf8", $dataSourceUsername, $dataSourcePassword);
				}
				// set errormode to exceptions
				$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$result = $db->query($dataSourceQuery);
				$resultAll = $result->fetchAll(PDO::FETCH_ASSOC);

				// close file db connection
				$db = null;

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

			if($dataSourceType == "JSON"){
				$fileContents = file_get_contents($dataSourceName);
				$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
				// $fileContents = trim(str_replace('"', "'", $fileContents));
				$fileContents = json_decode($fileContents);

				// return result
				return $fileContents;
			}

			if($dataSourceType == "htmlToJSON"){
				$convertableString = str_replace(array("\n", "\r", "\t"), '', $dataSourceQuery);
				$convertableString = str_replace("</p>", "\r</p>", $convertableString);
				$convertableString = trim(str_replace('"', "'", $convertableString));
				$resultJSON = htmlToObject($convertableString);
				return $resultJSON;
			}

			if($dataSourceType != "SQLite" && $dataSourceType != "MySQL" && $dataSourceType != "XML" && $dataSourceType != "JSON" && $dataSourceType != "htmlToJSON"){
				echo "\ndataSourceType [".$dataSourceType."] is not supported.\n";
			}
		}catch(PDOException $e) {
			// print PDOException message
			echo $e->getMessage();
		}

	}


	// helper functions for htmlToJSON conversion
	function htmlToObject($html) {
		$dom = new DOMDocument();
		// $dom->loadHTML($html);
		$dom->loadHTML('<?xml encoding="UTF-8">'.$html);
		return elementToObject($dom->documentElement, "");
	}

	function elementToObject($element, $previous) {
		// echo $element->tagName, "\n";
		if($previous!=""){
			$previous = $previous."/";
		}
		$obj = array( "tag" => $element->tagName );
		foreach ($element->attributes as $attribute) {
			$obj[$attribute->name] = $attribute->value;
		}
		foreach ($element->childNodes as $subElement) {
			if ($subElement->nodeType == XML_TEXT_NODE) {
				$obj["html"][] = $subElement->wholeText;
				$obj["html"]["closing"] = $previous.$element->tagName;
			}
			elseif ($subElement->nodeType == XML_CDATA_SECTION_NODE) {
				$obj["html"][] = $subElement->data;
				$obj["html"]["closing"] = $element->tagName;
			}
			else {
				$obj["html"][] = elementToObject($subElement, $element->tagName);
				$obj["html"]["closing"] = $element->tagName;
			}
		}
		return $obj;
	}
?>