/*
DBUI GLOBAL VARIABLES
© 2009 - 2012 Oliver Grünberg
www.DBUI.de
*/
SQLDatabaseType = "";
SQLDatabaseName = "";
SQLServerAddress = "";
SQLUsername = "";
SQLPassword = "";
DBUILogFileOutput = "hide";

SyncScriptFolder = "";
SyncIdentifier = "";


//*****************************************************************************************************************************************************************
/*
DBUI CONNECTOR
© 2009 - 2012 Oliver Grünberg
www.DBUI.de
*/
#target indesign

//Präferenzen aus Datei einlesen
var ConnectionPrefsFileFolder = new Folder( File($.fileName).parent);
var ConnectionPrefsFile = new File( ConnectionPrefsFileFolder.absoluteURI + "/DBUIPrefs.ini" );

ConnectionPrefsFile.encoding = "UTF-8";

//Datei anlegen, falls noch nicht vorhanden
if(!ConnectionPrefsFile.exists){
	ConnectionPrefsFile.open("w");
	//BOM anlegen!
	ConnectionPrefsFile.write("\uFEFF");
	//Beispiel-Vorgaben anlegen
	ConnectionPrefsFile.write("DBUIAddress=127.0.0.1\n");
	ConnectionPrefsFile.write("DBUIPort=6789\n");
	}

//Datei einlesen
ConnectionPrefsFile.open("r");

//Inhalt in Variable speichern
var ConnectionPrefsFileContent = ConnectionPrefsFile.read();

//Datei schließen
ConnectionPrefsFile.close();

//Inhalt aus Datei in zweidimensionales Array bringen
var ConnectionLookupTable = new Array();
var ConnectionLookupTableRow = new Array();

ConnectionLookupTableRow = ConnectionPrefsFileContent.split("\n");

for(ConnectionCount = 0; ConnectionCount < ConnectionLookupTableRow.length - 1; ConnectionCount++){
	ConnectionLookupTable[ConnectionCount] = new Array();
	ConnectionLookupTable[ConnectionCount] = ConnectionLookupTableRow[ConnectionCount].split("=")
	//Leerzeichen in Bezeichnung und Wert trimmen
	ConnectionLookupTable[ConnectionCount][0] = ConnectionLookupTable[ConnectionCount][0].replace(/^\s+|\s+$/g, '') ;
	ConnectionLookupTable[ConnectionCount][1] = ConnectionLookupTable[ConnectionCount][1].replace(/^\s+|\s+$/g, '') ;
	}

//alert(ConnectionLookupTable);
var DBUIAddress = ConnectionLookupTable[0][1];
var DBUIPort =ConnectionLookupTable[1][1];
//alert (DBUIAddress);
//alert (DBUIPort);

//Das geht:
//var TestResult = "";
//TestResult = (ConnectToDatabase("SELECT COUNT(Spalte1) FROM citytypo.bla"));
//TestResult = (ConnectToDatabase("SELECT * FROM bla"));
//TestResult = (ConnectToDatabase("UPDATE citytypo.bla SET Spalte2=\"c\" WHERE Spalte2=\"o\""));
//TestResult = (ConnectToDatabase("SELECT bla.Spalte1, blub.Spalte2 FROM citytypo.bla, citytypo.blub"));
//TestResult = (ConnectToDatabase("DROP TABLE blub"));
//TestResult = (ConnectToDatabase("CREATE TABLE blub(Spalte1 varchar(256), Spalte2 varchar(256), Spalte3 INT)"));
//TestResult = (ConnectToDatabase("INSERT INTO blub (Spalte1, Spalte2) VALUES ('hallo', 'oli')"));
//TestResult = (ConnectToDatabase("SELECT * FROM bla"));//zum Testen
//TestResult = (ConnectToDatabase("DELETE FROM bla WHERE(Spalte1=\"Kaiser\")"));
//TestResult = (ConnectToDatabase("ALTER TABLE bla ADD Zeitstempel TIMESTAMP"));

//TestResult = (ConnectToDatabase("SELECT name FROM sqlite_master"));//Übersicht der Tabellen einer SQLite Datenbank
//TestResult = (ConnectToDatabase("PRAGMA table_info(blub)"));//Übersicht der Spaltennamen einer SQLite Tabelle
//alert(TestResult);

function ConnectToDatabase(SQLStatement){
/*
	var DBUIAddress = "192.168.2.5";//IP Adresse über welche das DBUI erreichbar ist
	var DBUIPort = "6789";//Port zur oben angegebenen IP Adresse
	var DatabaseType = "MySQL";//Was für eine Datenbank soll angesprochen werden? "SQLite" oder "MySQL"
	var SQLDatabaseName = "Production";//"\\\\192.168.2.2\\Kunden\\swabianmedia\\ADC\\DB\\testdb.sqlite";//"C:\\Documents and Settings\\gruenberg\\Desktop\\InDesignScripting\\Testdaten\\testdb.sqlite";//MySQL Datenbank-Name oder SQLite Datenbank-Dateiname (lokaler Pfad!)
	var SQLServerAddress ="192.168.2.5";//"mysql11.1blu.de";//Über welche IP Adresse ist die Datenbank erreichbar? Nur beim Typ "MySQL" wichtig
	var SQLUsername = "publisher";//nur bei MySQL
	var SQLPassword = "dbpass";//nur bei MySQL
*/

	var Antwort = "";
	//var DBUIQuery = "GET <!--DBUIQuerySeparator-->" + SQLServerAddress + "<!--DBUIQuerySeparator-->" + SQLUsername+ "<!--DBUIQuerySeparator-->" + SQLPassword + "<!--DBUIQuerySeparator-->" + SQLDatabaseName + "<!--DBUIQuerySeparator-->" + SQLStatement + "<!--DBUIQuerySeparator--> HTTP 1.0 \n\n";
	var DBUIQuery = SQLDatabaseType + "<!--DBUIQuerySeparator-->" + 
		SQLServerAddress + "<!--DBUIQuerySeparator-->" + 
		SQLUsername+ "<!--DBUIQuerySeparator-->" + 
		SQLPassword + "<!--DBUIQuerySeparator-->" + 
		SQLDatabaseName + "<!--DBUIQuerySeparator-->" + 
		SQLStatement + "<!--DBUIQuerySeparator-->" + 
		app.name + "<!--DBUIQuerySeparator-->" + 
		app.version + "<!--DBUIQuerySeparator-->" + 
		DBUILogFileOutput;

	Verbindung = new Socket;
	Verbindung.timeout=600000;

	if (Verbindung.open (DBUIAddress + ":" + DBUIPort, "UTF-8")){
		Verbindung.write (DBUIQuery);
		//Angabe in Characters, NICHT in Bytes!
		Antwort = Verbindung.read(99999999999);
		Antwort = Base64.decode(Antwort);

		if (Antwort.length > 99999999999){
			Antwort = "<!--SQLResponse-->" + "<!--ERROR-->Result is too long (> 99999999999 chars)";
			//alert("<!--ERROR-->Result is too long (> 99999999999 chars)!", "Attention!");
			}
		Verbindung.close();
		}
	else {
		Antwort = "<!--SQLResponse-->" + "<!--ERROR-->No connection to DBUI!";
		alert("Error: No connection to DBUI!", "DBUI");
		}


	Antwort = Antwort.toString();
	var AntwortBeginn = Antwort.indexOf("<!--SQLResponse-->") + 18;
	Antwort = Antwort.substring(AntwortBeginn, Antwort.length);

	if (Antwort.substring(0, 12) == "<!--ERROR-->") {
		//alert(Antwort, "Attention!");
		Antwort = "";
		}


	//Ergebnis aus Antwort in Array aufsplitten
	//Umwandlung des Ergebnisses aus der Datenbank in ein zweidimensionales Array, um gezielt auf Werte und Spalten zugreifen zu können
	//Spaltenübersicht Beispiel: [0] = Indexnummer, [1] = JobID, [2] = JobOrder, [3] = Timestamp
	var Array1D = new Array();
	Array1D = Antwort.split("<!--SQLLineEnd-->");
	Antwort = null;//Speicher freigeben

	var DBResultArray = new Array();
	//Ergebnis wird nun in das Array DBResultArray umgewandelt, n-dimensional
	for (Zaehler1D = 0; Zaehler1D < Array1D.length; Zaehler1D++) {
		DBResultArray[Zaehler1D] = new Array();
		DBResultArray[Zaehler1D] = Array1D[Zaehler1D].split("<!--SQLDelimiter-->")
		}
	Array1D = null;//Speicher freigeben
	//alert(DBResultArray);//zum Testen [Zeile][Spalte]
	return DBResultArray;

	//Garbage Collection herbeiführen, ist anscheinend nicht notwendig
	//$.gc();
	}




//*****************************************************************************************************************************************************************
/*
Base64 encode / decode
http://www.webtoolkit.info/
*/

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return string;
	}
}

//*****************************************************************************************************************************************************************
/*
DBUI CORE FUNCTIONS
© 2009 - 2012 Oliver Grünberg
www.DBUI.de
*/

/*
if(app.name=="Adobe InDesign" && app.version.split(".")[0]!=6){
	alert("Ooops, this version of DBUI only works with Adobe InDesign CS4...", "Attention!");
	exit();
	}

if(app.name=="ExtendScript Toolkit" && app.version.split(".")[0]!=3){
	alert("Ooops, this version of DBUI only works with ExtendScript Toolkit v3...", "Attention!");
	exit();
	}
*/
//##########################################################
//app.activeDocument.xmlViewPreferences.showAttributes = false;
//app.activeDocument.xmlViewPreferences.showStructure = false;
//app.activeDocument.xmlViewPreferences.showTaggedFrames = false;
//app.activeDocument.xmlViewPreferences.showTagMarkers = false;
//app.activeDocument.xmlViewPreferences.showTextSnippets = false;


function AddFrame(xFrame, yFrame, wFrame, hFrame, StringOrFile){
	var TempFrame = app.activeWindow.activePage.rectangles.add();
	var TempxFrame = xFrame;
	var TempyFrame = yFrame;
	var TempwFrame = wFrame + xFrame;
	var TemphFrame = hFrame + yFrame;

	TempFrame.geometricBounds = [TempyFrame, TempxFrame, TemphFrame, TempwFrame];

	if(typeof(StringOrFile) == "string"){
		TempFrame.contentType = 1952412773;
		TempFrame.getElements()[0].contents = StringOrFile;
		return TempFrame.getElements()[0];
	}
	if(typeof(StringOrFile) == "object"){
		var TempPic = new File(StringOrFile);
		TempFrame.place (TempPic, false);
		return TempFrame;
	}
}


function AppendToFrame(FrameObject, StringOrTwoDArray){
	//Array -> Tabelle
	if (StringOrTwoDArray instanceof Array){
		//Höchste Anzahl benötigter Spalten herausfinden
		var ColMaxCount = new Array();
		for(var NewTableRowCounter=0; NewTableRowCounter<=StringOrTwoDArray.length-1; NewTableRowCounter++){
			//alert(NewTableArray[NewTableRowCounter].length);
			ColMaxCount[NewTableRowCounter] = StringOrTwoDArray[NewTableRowCounter].length;
		}
		//Hilfsfunktion zum Zahlen sortieren
		function Numsort (a, b) {
		  return b-a;
		}
		//Höchster Spaltenwert
		ColMaxCount = ColMaxCount.sort(Numsort)[0];

		//Erste Zeile mit 1 Zelle exemplarisch anlegen
		var TempAppendedTable = FrameObject.tables.add();
		TempAppendedTable.columnCount = ColMaxCount; //Limit: 200
		TempAppendedTable.bodyRowCount = 1;

		//Inhaltszeilen anlegen
		for(var NewTableRowCounter=0; NewTableRowCounter<=StringOrTwoDArray.length-2; NewTableRowCounter++){
			TempAppendedTable.rows[NewTableRowCounter].contents = StringOrTwoDArray[NewTableRowCounter];
			TempAppendedTable.rows.add();
		}

		//Letzte leere Zeile entfernen
		TempAppendedTable.rows.lastItem().remove();
		return TempAppendedTable;
	//Kein Array -> String
	}else{
		FrameObject.parentStory.insertionPoints[-1].contents = StringOrTwoDArray;
		var TempAppendedText = FrameObject.parentStory.characters.itemByRange(-1, -StringOrTwoDArray.length);
		return TempAppendedText;
	}
}


function TagThis(TagObject, SyncScript, SyncIdentifier){
	//SOLL: InsertionPoint, Word, Text, Paragraph, Character, TextColumn, Story, Table, TextFrame, Rectangle, Image
	//IST:     InsertionPoint, Word, Text, Paragraph, Character, TextColumn,          , Table, TextFrame, Rectangle
	var DBUITagElement = "";
	var TempTagName = "DBUI";

	//Textframe
	if(TagObject == "[object TextFrame]"){
		if(TagObject.parentStory.associatedXMLElement == null){
			app.activeDocument.xmlElements.item(0).xmlElements.add(TempTagName, TagObject.parentStory);
		}
		if(!TagObject.parentStory.associatedXMLElement.xmlAttributes.item("SyncScript").isValid){
			TagObject.parentStory.associatedXMLElement.xmlAttributes.add("SyncScript", SyncScript);
		}else{
			TagObject.parentStory.associatedXMLElement.xmlAttributes.item("SyncScript").value = SyncScript;
		}
		if(!TagObject.parentStory.associatedXMLElement.xmlAttributes.item("SyncIdentifier").isValid){
			TagObject.parentStory.associatedXMLElement.xmlAttributes.add("SyncIdentifier", SyncIdentifier);
		}else{
			TagObject.parentStory.associatedXMLElement.xmlAttributes.item("SyncIdentifier").value = SyncIdentifier;
		}
		return TagObject.parentStory.associatedXMLElement;//XML Element zurückgeben
	}
	//Rectangle
	if(TagObject == "[object Rectangle]"){
		if(TagObject.associatedXMLElement == null){
			app.activeDocument.xmlElements.item(0).xmlElements.add(TempTagName, TagObject);
		}
		if(!TagObject.associatedXMLElement.xmlAttributes.item("SyncScript").isValid){
			TagObject.associatedXMLElement.xmlAttributes.add("SyncScript", SyncScript);
		}else{
			TagObject.associatedXMLElement.xmlAttributes.item("SyncScript").value = SyncScript;
		}
		if(!TagObject.associatedXMLElement.xmlAttributes.item("SyncIdentifier").isValid){
			TagObject.associatedXMLElement.xmlAttributes.add("SyncIdentifier", SyncIdentifier);
		}else{
			TagObject.associatedXMLElement.xmlAttributes.item("SyncIdentifier").value = SyncIdentifier;
		}
		return TagObject.associatedXMLElement;//XML Element zurückgeben
	}
	if(TagObject == "[object Word]" || TagObject == "[object Paragraph]" || TagObject == "[object InsertionPoint]" || TagObject == "[object Character]" || TagObject == "[object Text]" || TagObject == "[object TextColumn]"){
		//Bei direkter Verwendung des Objekts über eine Variable
		if(TagObject.parent instanceof Array){
			//[object Story] von TagObject taggen, falls nicht schon geschehen
			try{
				app.activeDocument.xmlElements.item(0).xmlElements.add(TempTagName, TagObject.parent[0]);
			}catch(e){
				//alert(e);
			}
		}
		//Bei selection[0]
		if(!TagObject.parent instanceof Array){
			//[object Story] von TagObject taggen, falls nicht schon geschehen
			try{
				app.activeDocument.xmlElements.item(0).xmlElements.add(TempTagName, TagObject.parent);
			}catch(e){
				//alert(e);
			}
		}

		if(TagObject.parent == "[object Story]"){
			try{
				//alert(TagObject.contents + "\n" + TagObject.associatedXMLElements[0].xmlContent.contents);
				if( TagObject == TagObject.associatedXMLElements[0].xmlContent){
					TempTagName = TagObject.associatedXMLElements[0].markupTag.name;
					TagObject.associatedXMLElements[0].untag();
				}
			}catch(e){
				//alert(e);
			}

			TagObject = app.activeDocument.xmlElements.item(0).xmlElements.add(TempTagName, TagObject);
			TagObject.xmlAttributes.add("SyncScript", SyncScript);
			TagObject.xmlAttributes.add("SyncIdentifier", SyncIdentifier);
			return TagObject;//XML Element zurückgeben
		}
	}
	//Table
	if(TagObject == "[object Table]"){
		try{
			//alert(TagObject.contents + "\n" + TagObject.associatedXMLElement.xmlContent.contents);
			if( TagObject == TagObject.associatedXMLElement.xmlContent){
				TempTagName = TagObject.associatedXMLElement.markupTag.name;
				TagObject.associatedXMLElement.untag();
			}
		}catch(e){
			//alert(e);
		}
		TagObject = app.activeDocument.xmlElements.item(0).xmlElements.add(TempTagName, TagObject);
		TagObject.xmlAttributes.add("SyncScript", SyncScript);
		TagObject.xmlAttributes.add("SyncIdentifier", SyncIdentifier);
		return TagObject;//XML Element zurückgeben
	}else{
		return TagObject;
	}
}


function RecursiveSyncFrame(FrameObject){
	var TempRes = "";
	if (FrameObject instanceof Array) {
		//aus Array
		for (var c = 0; c < FrameObject.length; c++){
			//Rahmen
			if(FrameObject[c] == "[object XMLElement]"){
				TempRes = RecursiveSyncXMLElement(FrameObject[c]);
			}
			if(FrameObject[c] == "[object TextFrame]" || FrameObject[c] == "[object Rectangle]" || FrameObject[c] == "[object Image]" || FrameObject[c] == "[object Story]"){
				TempRes = RecursiveSyncXMLElement(FrameObject[c].associatedXMLElement);
			}
		}
	//direkt
	} else {
		//alert("direkt");
		if(FrameObject == "[object XMLElement]"){
			TempRes = RecursiveSyncXMLElement(FrameObject);
		}
		if(FrameObject == "[object TextFrame]" || FrameObject == "[object Rectangle]" || FrameObject == "[object Image]" || FrameObject == "[object Story]"){
			TempRes = RecursiveSyncXMLElement(FrameObject.associatedXMLElement);
		}
	}
	return TempRes;
}


function RecursiveSyncXMLElement(TaggedXMLElement){
	if(TaggedXMLElement == "[object XMLElement]"){
		SyncXMLElement(TaggedXMLElement);

		//Sub Elemente
		for(var i = 0; i < TaggedXMLElement.xmlElements.length; i++){
			//alert("Sub Element: " + TaggedXMLElement.xmlElements[i].contents);
			RecursiveSyncXMLElement(TaggedXMLElement.xmlElements[i]);
		}
		return TaggedXMLElement;
	}else{
		return false;
	}
}


function SyncXMLElement(TaggedXMLElement){
	//Wenn kein XML Element reinkommt, dann vom Objekt das XML Element losschicken
	if(TaggedXMLElement != "[object XMLElement]"){
		if(TaggedXMLElement == "[object Table]" || TaggedXMLElement == "[object TextFrame]" || TaggedXMLElement == "[object Rectangle]" || TaggedXMLElement == "[object Image]" || TaggedXMLElement == "[object Story]"){
			if(TaggedXMLElement.associatedXMLElement.isValid){
				SyncXMLElement(TaggedXMLElement.associatedXMLElement);
			 }
		 }
		else if(TaggedXMLElement == "[object Word]" || TaggedXMLElement == "[object Paragraph]" || TaggedXMLElement == "[object InsertionPoint]" || TaggedXMLElement == "[object Character]" || TaggedXMLElement == "[object Text]" || TaggedXMLElement == "[object TextColumn]" || TaggedXMLElement == "[object Line]"){
			if(TaggedXMLElement.associatedXMLElements[0].isValid){
				SyncXMLElement(TaggedXMLElement.associatedXMLElements[0]);
			}
		 }else{
			 return TaggedXMLElement;
		}
	}else{//Nur wenn ein XML Element reinkommt
		if(TaggedXMLElement != null){
			if(TaggedXMLElement.xmlAttributes.length > 1){//WENN MINDESTENS 2 ATTRIBUTE DA SIND!!!
				if(TaggedXMLElement.xmlAttributes.item("SyncScript").isValid && TaggedXMLElement.xmlAttributes.item("SyncIdentifier").isValid){
					//SyncIdentifier = TaggedXMLElement.xmlAttributes.item("SyncIdentifier").value;//GLOBAL für externe Scripte

					if (TaggedXMLElement.xmlContent == "[object Image]" || TaggedXMLElement.xmlContent == "[object EPS]" || TaggedXMLElement.xmlContent == "[object PDF]" || TaggedXMLElement.xmlContent == "[object PICT]" || TaggedXMLElement.xmlContent == "[object WMF]"){
						//TaggedXMLElement.xmlContent.place (new File( $.evalFile(File(File($.fileName).parent.absoluteURI + TaggedXMLElement.xmlAttributes.item("SyncScript").value))), false);
						//alert(SyncScriptFolder + TaggedXMLElement.xmlAttributes.item("SyncScript").value);
						TaggedXMLElement.xmlContent.place (new File( $.evalFile(File(SyncScriptFolder + TaggedXMLElement.xmlAttributes.item("SyncScript").value))), false);
						return TaggedXMLElement;
					}
					if (TaggedXMLElement.xmlContent == "[object Story]" || TaggedXMLElement.xmlContent == "[object Text]"){
						//TaggedXMLElement.contents = $.evalFile(File(File($.fileName).parent.absoluteURI + TaggedXMLElement.xmlAttributes.item("SyncScript").value));
						//alert(TaggedXMLElement.xmlAttributes.item("SyncScript").value);
						TaggedXMLElement.contents = $.evalFile(File(SyncScriptFolder + TaggedXMLElement.xmlAttributes.item("SyncScript").value));
						return TaggedXMLElement;
					}
					if (TaggedXMLElement.xmlContent == "[object Table]"){
						var NewTableArray ="";
						var TempRowsCount = "";
						var TempColsCount = "";

						//Inhalt für neue Tabelle aufnehmen; Format ist ein 2D-Array!!!
						//NewTableArray = $.evalFile(File(File($.fileName).parent.absoluteURI +TaggedXMLElement.xmlAttributes.item("SyncScript").value));
						NewTableArray = $.evalFile(File(SyncScriptFolder + TaggedXMLElement.xmlAttributes.item("SyncScript").value));

						//Zeilen löschen, bis auf 1
						if (TaggedXMLElement.xmlContent.rows.length>1){
							TempRowsCount = TaggedXMLElement.xmlContent.rows.length;
							for(var RowCounter = 0; RowCounter < TempRowsCount-1; RowCounter++){
								TaggedXMLElement.xmlContent.rows.lastItem().remove();
							}
						}

						//Spalten löschen, bis auf 1
						if (TaggedXMLElement.xmlContent.columns.length>1){
							TempColsCount = TaggedXMLElement.xmlContent.columns.length;
							for(var ColCounter = 0; ColCounter< TempColsCount-1; ColCounter++){
								TaggedXMLElement.xmlContent.columns.lastItem().remove();
							}
						}

						//Höchste Anzahl benötigter Spalten herausfinden
						var ColMaxCount = new Array();
						for(var NewTableRowCounter=0; NewTableRowCounter<=NewTableArray.length-1; NewTableRowCounter++){
							//alert(NewTableArray[NewTableRowCounter].length);
							ColMaxCount[NewTableRowCounter] = NewTableArray[NewTableRowCounter].length;
						}
						//Hilfsfunktion zum Zahlen sortieren
						function Numsort (a, b) {
						  return b-a;
						}
						//Höchster Spaltenwert
						ColMaxCount = ColMaxCount.sort(Numsort)[0];

						//Erste Zeile exemplarisch anlegen
						for(var NewTableColCounter=1; NewTableColCounter<=ColMaxCount-1; NewTableColCounter++){
							TaggedXMLElement.xmlContent.columns.add();
						}

						//Inhaltszeilen anlegen
						for(var NewTableRowCounter=0; NewTableRowCounter<=NewTableArray.length-2; NewTableRowCounter++){
							TaggedXMLElement.xmlContent.rows[NewTableRowCounter].contents = NewTableArray[NewTableRowCounter];
							TaggedXMLElement.xmlContent.rows.add();
						}

						//Letzte leere Zeile entfernen
						TaggedXMLElement.xmlContent.rows.lastItem().remove();

						return TaggedXMLElement;
					}else{
						//alert("not yet supported: " + TaggedXMLElement.xmlContent + ": " + TaggedXMLElement.xmlContent.contents);
						return false;
					}
				}else{
					return false;
				}
			}
		}
	}
}


function CreatePlaceholderImage(){
	//Platzhalter Bild aus Binärstring schreiben
	var PlaceholderImageBinaryString = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00a\x00\x00\x00X\b\x02\x00\x00\x00j\x11\x0E\u0091\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00 cHRM\x00\x00z&\x00\x00\u0080\u0084\x00\x00\u00FA\x00\x00\x00\u0080\u00E8\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17p\u009C\u00BAQ<\x00\x00\x01ZIDATx^\u00ED\u00DA\u00C1\t\u00C2@\x00E\u00C1X\u00A0\u009D\u00A5\x02{\u00B1\x18+\u0089\x01\u00EF\u00CE!\u00EC\u00EA\u00C2\x0B\u00DE|F3~A\u00C4\u00DBq\x1C[\u00C7w\u0081\u00D3\u00A8\u00E3\u00BB\u00C0\x16\x10\x052\"\u00D1\u0091QF\x16p\u00D1\u008E2\u00B2\u0080\u008B\u0089;\u00DA\u00B6\u00F3\u009B\u00D8\u00A5\u009B/gH\u0091\u0091Y3\u00CA\u00C8\x02.\u00DAQF\x16p\u00D1\u008E2\u00B2\u0080\u008Bv\u0094\u0091\x05\\\u00B4\u00A3\u008C,\u00E0\u00A2\x1Ded\x01\x17\u00ED(#\x0B\u00B8hG\x19Y\u00C0E;\u00CA\u00C8\x02.\u00DAQF\x16p\u00D1\u008E2\u00B2\u0080\u008Bv\u0094\u0091\x05\\\u00B4\u00A3\u008C,\u00E0\u00A2\x1Ded\x01\x17\u00ED(#\x0B\u00B8XgG\u00FB\u00EE\u00AB\x19S\u00ACc\u00F4|\u008E\x11\u00F0Y3\u00CA\u00C8\x02.\u00DAQF\x16p\u00B1\u00CE\u008E^/_\u00CD\u0098b\u00A2\u00D1\u00FD\u00BE\u00E2\x1F\u008FO\u00F6\u0089F\u008FGF\x1A\u00FA\u00F9a\u00B9\u00F2\x1Fv\u009D~\u00DC\u00FD\x13w4\u00EE\"\x06\u009F9#\x03g\u0094\u0091\x05\\\u00B4\u00A3\u008C,\u00E0\u00A2\x1D\u00FD\u0095\u00D1\u0095/G\u009F\u00C7\u00FE\u00E8\u0098\u00F8\u00C4\x19\u00F9=\u00CE(#\x0B\u00B8hG\x19Y\u00C0E;\u00CA\u00C8\x02.\u00DAQF\x16p\u00D1\u008E2\u00B2\u0080\u008Bv\u0094\u0091\x05\\\u00B4\u00A3\u008C,\u00E0\u00A2\x1Ded\x01\x17\u00ED(#\x0B\u00B8hG6Z\u00B6\u0098\u00F8\u009B\x7FF\u00CB\n\u00F8\u0085\u00B7\u00A3\u008C,\u00E0\u00A2\x1Ded\x01\x17\u00ED(#\x0B\u00B8hG6z\x03\u009Cs\u00D4\u00CDK\u00B4\x14\u00F2\x00\x00\x00\x00IEND\u00AEB`\u0082"));
	var PlaceholderImageFolder = new Folder( File($.fileName).parent);
	PlaceholderImageFolder.create();
	PlaceholderImage = new File( PlaceholderImageFolder.absoluteURI + "/PlaceholderImage.png" );
	PlaceholderImage.encoding = "BINARY";
	PlaceholderImage.open("w");
	PlaceholderImage.write(PlaceholderImageBinaryString);
	PlaceholderImage.close();
	return PlaceholderImage;
}


function StringToTwoDArray(SeparatedString, ColumnSeparator, RowSeparator){
	if(SeparatedString == "" || ColumnSeparator == "" || RowSeparator == ""){
		return false;
	}else{
		var HasColumnSeparator = SeparatedString.indexOf(ColumnSeparator);
		var LastChar = SeparatedString.substring(SeparatedString.length-RowSeparator.length, SeparatedString.length);
		if(LastChar != RowSeparator){
			SeparatedString = SeparatedString + RowSeparator;
		}

		var Array1D = new Array();
		Array1D = SeparatedString.split(RowSeparator);
		var Array2D = new Array();

		for (Zaehler1D = 0; Zaehler1D < Array1D.length; Zaehler1D++) {
			Array2D[Zaehler1D] = new Array();
			Array2D[Zaehler1D] = Array1D[Zaehler1D].split(ColumnSeparator);
		}
		Array1D = null;
		return Array2D;
	}
}


function TwoDArrayToString(TwoDArray, ColumnSeparator,RowSeparator){
	var TempResult = "";
	for (r=0;r<TwoDArray.length-1;r++){
		TempResult += TwoDArray[r].join(ColumnSeparator) + RowSeparator;
	}
	TempResult = TempResult.substring(0, (TempResult.length - RowSeparator.length));
	return TempResult;
}


function AddNewPage(){
	var TempPage = app.activeDocument.pages.add(LocationOptions.AT_END);
	app.activeWindow.activePage = TempPage;
	return TempPage;
}


function MoveObjectToPage(FrameObject, PageObject){
	var TempBounds = FrameObject.geometricBounds;
	app.activeDocument.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;//ARGHH!
	FrameObject.move (PageObject);
	FrameObject.geometricBounds = TempBounds;
	return FrameObject;
}


function SetPageSize(xWidth, yHeight){
	app.activeDocument.documentPreferences.pageWidth = xWidth;
	app.activeDocument.documentPreferences.pageHeight = yHeight;
	return true;
}


function PlaceSnippet(SnippetPath, xSnippet, ySnippet){
	var TempSnippetPath = new File(SnippetPath);
	//var TempSnippet = app.activeDocument.pages[0].place(TempSnippetPath,[0, 0]);
	var TempSnippet = app.activeWindow.activePage.place(TempSnippetPath,[xSnippet, ySnippet]);
	return TempSnippet;
}


function SearchReplaceTextframe(TextframeObject, SearchText, ReplaceText){
	app.findTextPreferences = NothingEnum.nothing;
	app.changeTextPreferences = NothingEnum.nothing;
	app.findTextPreferences.findWhat = SearchText;
	app.changeTextPreferences.changeTo = ReplaceText;
	TextframeObject.parentStory.changeText();
	return TextframeObject;
}
