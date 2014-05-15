/*
Mail Demo
© 2012 Oliver Grünberg
www.DBUI.de
*/

#include ../AdminScripts/DBUILoader.jsx;


//Globale Variablen
SQLDatabaseType = "SQLite";
SQLDatabaseName = "D:\\xampp\\htdocs\\dbui\\db.sqlite";
SQLServerAddress = "";
SQLUsername = "";
SQLPassword = "";
DBUILogFileOutput = "show";


//Datenbank abfragen
var TempJob = ConnectToDatabase("SELECT id FROM artikel WHERE status = 'pending' ORDER BY ID ASC LIMIT 1");
var TempJobID = TempJob[0][0];

TempJob = ConnectToDatabase("SELECT timestamp, status, anrede, vorname, nachname, text, firma, strasse, plz, stadt, land, email FROM artikel WHERE id = '" + TempJobID + "' LIMIT 1");
//alert(TempJob);
var TempTimestamp = TempJob[0][0];
var TempStatus = TempJob[0][1];
var TempAnrede = TempJob[0][2];
var TempVorname = TempJob[0][3];
var TempNachname = TempJob[0][4];
var TempText = TempJob[0][5];
var TempFirma = TempJob[0][6];
var TempStrasse = TempJob[0][7];
var TempPLZ = TempJob[0][8];
var TempStadt = TempJob[0][9];
var TempLand = TempJob[0][10];
var TempEMail = TempJob[0][11];


//Neuen Dateinamen anlegen
var TempDocName = TempJobID + "_" + TempTimestamp;
if(TempJobID == ""){
	alert("... bitte erst etwas in die Datenbank eingeben!", "DBUI");
	exit();
	}

//Neues Layout Dokument anlegen
var TempDoc = app.documents.add();
//TempDoc = app.activeDocument;

//Maßeinheiten festlegen
TempDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
TempDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

//Seitengröße angeben
SetPageSize(210, 105);

//Einen Werbetext verfassen
var Werbetext = "Hallo " + TempVorname + ",\r\r";
Werbetext += "noch nie war es sinnvoller, sich selbst eine Postkarte zu schreiben!\r\rAlles was Sie hier lesen ist eine reine Werbemaßnahme, speziell und nur für Sie, " + TempAnrede + " " + TempNachname + "! Ist das nicht der Hammer?";
Werbetext += "\r\rStellen Sie sich mal vor, Sie geben in ein Webinterface etwas ein und sofort nach dem Abschicken erstellt Adobe InDesign daraus ein echtes Layout.";
Werbetext += "\r\rUnd das haben Sie eingegeben: " + TempText;
Werbetext += "\r\rDieses Prinzip nennt sich übrigens Database Publishing und man kann damit zum Beispiel Web-To-Print machen... so nebenbei. Oder wie wäre es mit beliebigen Drucksachen? Die Grenzen bestimmen dabei nur Sie.";
Werbetext += "\r\rInteresse? Wir beraten Sie gerne.\rSchreiben Sie uns einfach eine E-Mail an info@dbui.de\nund wir kommen in's Gespräch.";

//Eine Textbox hinzufügen
var Textframe1 = AddTextframe (105, 10, 95, 95, "");
var Text1 = AppendTextToTextframe (Textframe1, Werbetext);
Text1.fillColor = app.activeDocument.swatches.item("Black");
Text1.appliedFont = "Open Sans";
Text1.pointSize = 9;
Text1.appliedLanguage = "German: 2006 Reform";

//Ein Bild hinzufügen
var MyImage = AddImageframe (10, 10, 85, 85, "/D/dbui/images/DBUI_logo_mit_Untertitel.pdf");
MyImage.fit(FitOptions.PROPORTIONALLY);
MyImage.fit(FitOptions.CENTER_CONTENT);
MyImage.strokeWeight = 0;
//exit();


//Layout speichern
app.activeDocument.save(new File("/D/xampp/htdocs/dbui/" + TempDocName + ".indd"));
//app.activeDocument.close();

//Layout als PDF exportieren
app.activeDocument.exportFile(ExportFormat.pdfType, new File("/D/xampp/htdocs/dbui/" + TempDocName + ".pdf"), false);
app.activeDocument.close(SaveOptions.no);

//Fertigen Job an die angegebene E-Mail verschicken
var reply = "";
conn = new Socket;
if (conn.open ("localhost:80")) {
	conn.write ("GET /dbui/mailer.php?Attachment=" + TempDocName + ".pdf" + "&Empfaenger=" + TempEMail + "&Vorname=" + TempVorname + " HTTP/1.0\n\n");
	reply = conn.read(999999);
	conn.close();
}

//Diesen Job als erledigt in der Datenbank abspeichern
ConnectToDatabase("UPDATE artikel SET status='completed' WHERE id = '" + TempJobID + "'");

alert("... fertig.", "DBUI");