<?php
	//DBUI - DataBase User Interface
	//v1.1.0.0
	//© 2009-2014 Dipl.-Ing. (FH) Oliver Grünberg, Schreiber & Freunde GmbH, www.schreiber-freunde.de

	//header("Content-Type: text/html; charset=utf-8");
	error_reporting(1);

	//Ausführungszeit unendlich
	set_time_limit (0);

	$PrefsFileName = "DBUIPrefs.ini";
	$LogFileName = "DBUIlog.txt";
	$WelcomeMessage = "-------------------------------------------------------------\r\n".
					"    DBUI - DataBase User Interface\r\n".
					"    © 2009 - 2014 Dipl.-Ing. (FH) Oliver Grünberg\r\n".
					"    Visit www.dbui.de for further information!\r\n".
					"-------------------------------------------------------------\r\n";
 
	function FileWriter($WriteLine, $WriteFileName, $WriteMode){
		$FileWriterHandle = fopen($WriteFileName, $WriteMode);
		fwrite($FileWriterHandle, $WriteLine);
		fclose($FileWriterHandle);
	}

	//Logfile anlegen
	//mit BOM für utf8
	FileWriter(chr(239).chr(187).chr(191), $LogFileName, "w");
	FileWriter($WelcomeMessage, $LogFileName, "a");

	//Prüfen ob Voreinstellungs-Datei vorhanden ist
	if (file_exists($PrefsFileName)==false){
		//falls nicht vorhanden, wird sie angelegt...
		FileWriter(chr(239).chr(187).chr(191), $PrefsFileName, "w");
		FileWriter("DBUIAddress=127.0.0.1\r\n", $PrefsFileName, "a");
		FileWriter("DBUIPort=6789\r\n", $PrefsFileName, "a");
	}

	//... und danach eingelesen
	$Prefs = file($PrefsFileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
	for($i=0;$i<count($Prefs);$i++){
		$PrefsArray[$i] = explode("=", $Prefs[$i]);
	}
	$DBUIAddress = trim($PrefsArray[0][1]);
	// exo_setglobalvariable ("DBUIAddress", $DBUIAddress, false);//DBUIAddress auch an Exe Wrapper übergeben, um beim Beenden der Exe ein Exit Signal an php zu senden 
	$DBUIPort = trim($PrefsArray[1][1]);
	// exo_setglobalvariable ("DBUIPort", $DBUIPort, false);//DBUIPort auch an Exe Wrapper übergeben, um beim Beenden der Exe ein Exit Signal an php zu senden 

	FileWriter("> ".date("Y.m.d, H:i:s",time())."\r\n", $LogFileName, "a");
	FileWriter("DBUI has been started.\r\n\r\n", $LogFileName, "a");

	//Bild laden zur Anzeige in Exe Wrapper
	// ob_implicit_flush (1);
	// echo(str_repeat(" ",256));
	// echo "<img src='ghe://heserver/dbui_logo_mit_untertitel_8bit_hg_weiss.png'>";
	// sleep(1);

	//Ab jetzt wird in einer Endlosschleife auf eingehende Anfragen gelauscht
	while(true){
		//Status des Exe Wrappers erfassen, um bei Bedarf sauber zu schließen
		// if (exo_getglobalvariable("isappterminated", "0") == "1"){
		// 	break;
		// }


		//TCP Stream Socket erzeugen
		$Sock = socket_create(AF_INET, SOCK_STREAM, 0);

		//Socket an Port und IP Adresse binden
		socket_bind($Sock, $DBUIAddress, $DBUIPort) or die(FileWriter("Error! Unable to bind to address. Please check settings file \"".$PrefsFileName."\", the entered values at DBUIAddress:DBUIPort might be invalid or already in use!\r\n\r\n", "a"));

		//Auf Verbindungen lauschen
		socket_listen($Sock);

		//Eingehende Anfragen als Child Prozess akzeptieren
		$Client = socket_accept($Sock);

		//Die Anfrage bis zur angegebenen Länge vom Client einlesen
		$Input = socket_read($Client, 1048576);//entspricht 1 MB, alter Wert: 8192 Bytes

		//Input auf Exit Signal prüfen
		if(substr($Input, 0, 13)=="GET /ExitDBUI"){
			//echo "<br>DBUI has been terminated.";
			FileWriter("> ".date("Y.m.d, H:i:s",time())."\r\n", $LogFileName, "a");
			FileWriter("DBUI: terminated by user.\r\n\r\n", $LogFileName, "a");
			break;
		}

		//Datenbank abfragen
		$Output = "<!--SQLResponse-->";
		$TempOutputLogFile = "";
		$InputArray = explode("<!--DBUIQuerySeparator-->", $Input);
		$SQLDatabaseType = $InputArray[0];
		$SQLServerAddress = $InputArray[1];
		$SQLUsername = $InputArray[2];
		$SQLPassword = $InputArray[3];
		$SQLDatabaseName = $InputArray[4];
		$SQLStatement = $InputArray[5];
		$ClientName = $InputArray[6];
		$ClientVersion = explode(".", $InputArray[7]);
		$DBUILogFileOutput = $InputArray[8];
		$SQLResult = "";
		$ColumnCounter = "";
		$ColumnCounterTemp = "";
		$ResultRow = "";
		$DB = "";

socket_write($Client, $Input, strlen($Input));
//***********************
/*
		//Bei nicht erlaubtem Client eine Fehlermeldung schmeißen
		if($ClientName != "Adobe InDesign" or $ClientVersion[0] < 8){
			FileWriter("> ".date("Y.m.d, H:i:s",time())."\r\n", $LogFileName, "a");

			//###
			$TempClientErrorMsg = "Ooops, I don't understand the client...";

			if($ClientName == "Adobe InDesign"){
				FileWriter($ClientName." ".implode(".", $ClientVersion)."\r\n", $LogFileName, "a");
				FileWriter($TempClientErrorMsg."\r\n\r\n", $LogFileName, "a");
				socket_write($Client, base64_encode("<!--SQLResponse--><!--ERROR-->".$TempClientErrorMsg), strlen(base64_encode("<!--SQLResponse--><!--ERROR-->".$TempClientErrorMsg)));
			}

			if($ClientName != "Adobe InDesign"){
				FileWriter($Input."\r\n", $LogFileName, "a");
				FileWriter($TempClientErrorMsg."\r\n\r\n", $LogFileName, "a");
				//socket_write($Client, $TempClientErrorMsg, strlen($TempClientErrorMsg));
				socket_write($Client, $Input, strlen($Input));
			}
			//###

		} else {
			//MySQL Datenbank abfragen
			if ($SQLDatabaseType=="MySQL"){
				mysql_connect($SQLServerAddress, $SQLUsername, $SQLPassword);// or die ("<!--ERROR-->".mysql_error());
				mysql_select_db($SQLDatabaseName);// or die ("<!--ERROR-->".mysql_error());
				mysql_query("SET CHARACTER SET utf8");
				mysql_query("SET NAMES 'utf8' COLLATE 'utf8_bin'");//utf8_bin: Stringvergleich anhand des Binärwertes jedes einzelnen Zeichens im String

				if (!$SQLResult = mysql_query($SQLStatement)) {
					$Output = "<!--SQLResponse--><!--ERROR-->".mysql_error();// or die ("<!--ERROR-->".mysql_error());
					}

				//mysql_num_fields und mysql_fetch_row nur ausführen wenn ein brauchbares Ergebnis vorliegt
				if ($SQLResult!=1) {
					$ColumnCounter = mysql_num_fields($SQLResult);

					while ($ResultRow = mysql_fetch_row($SQLResult)) {
						for($ColumnCounterTemp = 0; $ColumnCounterTemp < $ColumnCounter; $ColumnCounterTemp++){
							if ($ColumnCounterTemp < $ColumnCounter - 1) {
								$Output .= $ResultRow[$ColumnCounterTemp]."<!--SQLDelimiter-->";
								}
							if ($ColumnCounterTemp == $ColumnCounter - 1) {
								$Output .= $ResultRow[$ColumnCounterTemp]."<!--SQLLineEnd-->";
								}
						}
					}
				}
				//Speicher wird nach Scriptdurchlauf sowieso freigegeben
				//mysql_free_result($SQLResult);//Weglassen, da es nur bei SELECT, SHOW, EXPLAIN und DESCRIBE Abfragen funktioniert-> Problem bei INSERT, DROP, ...
				//mysql_close();//normalerweise nicht notwendig
			}

			//SQLite3 Datenbankdatei abfragen
			if ($SQLDatabaseType=="SQLite"){
				//JavaScript Pfad-Schreibweise korrigieren
				if (file_exists($SQLDatabaseName)==true){
					$DB = new SQLite3($SQLDatabaseName);

					$SQLResult = $DB->query($SQLStatement);
					if ($SQLResult == true){
						$ColumnCounter = $SQLResult->numColumns();
						if ($ColumnCounter > 0) {
							while ($ResultRow = $SQLResult->fetchArray()) {
								for($ColumnCounterTemp = 0; $ColumnCounterTemp < $ColumnCounter; $ColumnCounterTemp++){
									if ($ColumnCounterTemp < $ColumnCounter - 1) {
										$Output .= $ResultRow[$ColumnCounterTemp]."<!--SQLDelimiter-->";
									}
									if ($ColumnCounterTemp == $ColumnCounter - 1) {
										$Output .= $ResultRow[$ColumnCounterTemp]."<!--SQLLineEnd-->";
									}
								}
							}
						}
					}
					if ($SQLResult == false){
						$Output = "<!--SQLResponse--><!--ERROR-->".$DB->lastErrorMsg();
					}
					$DB->close();
				}
				if (file_exists($SQLDatabaseName)==false){
					$Output = "<!--SQLResponse--><!--ERROR-->SQLite database file does not exist!";
				}
			}

			//Output an Client zurückgeben
			//Gibt falsche Länge zurück: socket_write($Client, $Output, strlen(utf8_decode($Output)));
			//Bricht bei einfachen Anführungszeichen im String ab: socket_write($Client, $Output, strlen($Output));
			socket_write($Client, base64_encode($Output), strlen(base64_encode($Output)));

			//Output in Logfile schreiben, falls gewünscht
			//... dazu Unnötiges für das LogFile entfernen
			$TempOutputSuche = array("<!--SQLResponse-->", "<!--SQLDelimiter-->", "<!--SQLLineEnd-->", "<!--ERROR-->");
			$TempOutputErsetze = array("", "\t", "\r\n", "");
			$TempOutputLogFile = str_replace($TempOutputSuche, $TempOutputErsetze, $Output);

			if ($DBUILogFileOutput == "show") {
				FileWriter("> ".date("Y.m.d, H:i:s",time())."\r\n", $LogFileName, "a");
				FileWriter($SQLDatabaseType.":".$SQLUsername.":".$SQLPassword."@".$SQLServerAddress.":".$SQLDatabaseName."\r\n", $LogFileName, "a");
				FileWriter($SQLStatement."\r\n", $LogFileName, "a");
				//FileWriter($Output."\r\n", $LogFileName, "a");
				FileWriter($TempOutputLogFile."\r\n\r\n", $LogFileName, "a");
			}
			//Output trotzdem in Logfile schreiben, falls es einen SQL Fehler gegeben hat
			if ($DBUILogFileOutput != "show" && substr($Output, 0, 30)=="<!--SQLResponse--><!--ERROR-->") {
				FileWriter("> ".date("Y.m.d, H:i:s",time())."\r\n", $LogFileName, "a");
				FileWriter($SQLDatabaseType.":".$SQLUsername.":".$SQLPassword."@".$SQLServerAddress.":".$SQLDatabaseName."\r\n", $LogFileName, "a");
				FileWriter($TempOutputLogFile."\r\n\r\n", $LogFileName, "a");
			}
		}
*/
//***********************
		//Client Child Socket schließen
		socket_close($Client);
	}

	//Hauptsocket schließen
	socket_close($Sock);
?>