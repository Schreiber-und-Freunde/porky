/*
PRODUCTION LOOP
© 2009 - 2011 Oliver Grünberg
www.DBUI.de
*/

#include ../AdminScripts/DBUILoader.jsx;

//Globale Variablen
SQLDatabaseType = "MySQL";
SQLDatabaseName = "Production";
SQLServerAddress = "192.168.2.102";
SQLUsername = "publisher";
SQLPassword = "dbpass";

//Modus auf "loop" stellen
LoopChecker = true;
var SetMode = confirm("Would you like to start a production loop?" ,"no" ,"Attention");

if (SetMode == true) {
	ConnectToDatabase("UPDATE Production.Modus SET ProgramMode='loop'");

	while (LoopChecker == true) {
		//The result in available as a 2D array, e.g. [row][column]
		var ModusArray = ConnectToDatabase("SELECT ProgramMode FROM Production.Modus LIMIT 1");

		if (ModusArray[0][0] != "loop") {
			alert("Unable to work in loop mode.\r\rRestart this script for running InDesign production in loop mode,\rstop loop mode via web interface.", "Attention!");
			LoopChecker = false;
			}
		else {
			#include ProcessThis.jsx;
			}
		//LoopChecker = false;//Stops this script after the first loop
		$.sleep(5000);
		}
	}

