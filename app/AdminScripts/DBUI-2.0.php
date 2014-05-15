<?php
	//DBUI - DataBase User Interface v2.0.0.0
	//© 2009-2014 Dipl.-Ing. (FH) Oliver Grünberg, Schreiber & Freunde GmbH, www.schreiber-freunde.de
	//Quelle: http://www.php.net/manual/en/sockets.examples.php

	error_reporting(E_ALL);

	/* Allow the script to hang around waiting for connections. */
	set_time_limit(0);

	/* Turn on implicit output flushing so we see what we're getting
	 * as it comes in. */
	ob_implicit_flush();

	$address = '127.0.0.1';
	$port = 6789;

	echo "Welcome to DBUI - DataBase User Interface!\n******************************************\n";

	if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
		echo "socket_create() failed, reason: " . socket_strerror(socket_last_error()) . "\n";
		echo "\nquitting DBUI...\n\n";
		exit(0);
	}
//***
	if (!socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1)) { 
		echo "### Reusing socket: ".socket_strerror(socket_last_error($sock)."###"); 
		//exit; 
	}
//***
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

		//read socket
		$buf = socket_read($msgsock, 1048576, PHP_NORMAL_READ);

		//check GET
		$buf = explode(" ", $buf);
		var_dump($buf);

		//clean up / after GET
		$buf[1] = ltrim($buf[1], "/");

		echo "\nbase64 encoded GET: ".$buf[1];
		$bufUTF8 = base64_decode($buf[1]);
		echo "\nbase64 decoded GET: ".$bufUTF8."\n******************************************\n";

		if($bufUTF8 == "quit DBUI" || $bufUTF8 == "quit DBUI\n"){
			echo "\nquitting DBUI...\n\n";
			break;
		}

		//write socket Base64 encoded
		$bufBase64 = base64_encode($bufUTF8);
		$msg = "\n$bufBase64\n";
		socket_write($msgsock, $msg, strlen($msg));


		//closing socket after first reply!
		socket_close($msgsock);
	} while (true);

	socket_close($sock);
?>