/*
PROCESS THIS
© 2012 Oliver Grünberg
www.DBUI.de
*/

//Please note that this is NOT a standalone script, during production it is launched by ProductionLoop.jsx!
//Next line is for testing only
//#include ../AdminScripts/DBUILoader.jsx;



//Get the latest job which is pending in the table "OrderDetails", it has a unique ID
var TempJob = ConnectToDatabase("SELECT JobOrder, ID FROM Production.OrderDetails WHERE Status = 'pending' ORDER BY ID ASC LIMIT 1");
var TempJobOrderDescription = TempJob[0][0];
var TempJobID = TempJob[0][1];

//Do something only if NewJobOrderDescription is not empty
if (TempJobOrderDescription != "") {
	//Product "PKDINlang"
	if (TempJobOrderDescription == "PKDINlang") {
		try{
			var CurrentJobOrder = ConnectToDatabase("SELECT ID, JobOrder, ClientEMail, ClientFirstname, ClientLastname, ClientSalutation, ClientCompany, ClientStreetname, ClientZIP, ClientCity, ClientCountry, ClientComplimentText, ClientPersonalizedImage FROM OrderDetails WHERE ID = '" + TempJobID + "' LIMIT 1");
			var CurrentJobID = CurrentJobOrder[0][0];
				if (CurrentJobID == ""){CurrentJobID = 0;}
			var CurrentJobOrderDescription = CurrentJobOrder[0][1];
				if (CurrentJobOrderDescription == ""){CurrentJobOrderDescription = "UnknownJobOrder";}
			var ClientEMail = CurrentJobOrder[0][2];
				if (ClientEMail == ""){ClientEMail = "???@???.??";}
			var ClientFirstname = CurrentJobOrder[0][3];
				if (ClientFirstname == ""){ClientFirstname = "???";}
			var ClientLastname = CurrentJobOrder[0][4];
				if (ClientLastname == ""){ClientLastname = "???";}
			var ClientSalutation = CurrentJobOrder[0][5];
				if (ClientSalutation == ""){ClientSalutation = "???";}
			var ClientCompany = CurrentJobOrder[0][6];
				if (ClientCompany == ""){ClientCompany = "???";}
			var ClientStreetname = CurrentJobOrder[0][7];
				if (ClientStreetname == ""){ClientStreetname = "???";}
			var ClientZIP = CurrentJobOrder[0][8];
				if (ClientZIP == ""){ClientZIP = "???";}
			var ClientCity = CurrentJobOrder[0][9];
				if (ClientCity == ""){ClientCity = "???";}
			var ClientCountry = CurrentJobOrder[0][10];
				if (ClientCountry == ""){ClientCountry = "???";}
			var ClientComplimentText = CurrentJobOrder[0][11];
				if (ClientComplimentText == ""){ClientComplimentText = "???";}
			var ClientPersonalizedImage = CurrentJobOrder[0][12];
				if (ClientPersonalizedImage == ""){ClientPersonalizedImage = "/D/dbui/images/PlaceholderImage.png";}

			//Create new filename
			var TempDocName = CurrentJobID + "_" + CurrentJobOrderDescription;

			//Create new layout document
			var TempDoc = app.documents.add();
			var Page1 = AddNewPage();
			//TempDoc = app.activeDocument;

			//Set measurement units
			TempDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
			TempDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

			//Set page size
			SetPageSize(210, 105);

			//Add an image
			var Image1 = AddImageframe (-3, -3, 216, 111, "/D/dbui/images/" + ClientPersonalizedImage);
			Image1.fit(FitOptions.FILL_PROPORTIONALLY);
			Image1.fit(FitOptions.CENTER_CONTENT);
			Image1.strokeWeight = 0;

			//Add some text
			var Textframe1 = AddTextframe (30, 10, 140, 20, "");
			var Text1 = AppendTextToTextframe (Textframe1, ClientComplimentText);
			Text1.fillColor = app.activeDocument.swatches.item("C=0 M=100 Y=0 K=0");
			Text1.appliedFont = "Arial";
			Text1.pointSize = 12;
			Text1.appliedLanguage = "German: 2006 Reform";

			//Place snippet
			PlaceSnippet("/D/dbui/images/DBUILogoSnippet.idms", 184, 5);

			//Add another page
			var Page2 =AddNewPage();

			//Place snippet
			PlaceSnippet("/D/dbui/images/LineAndStampSnippet.idms", 120, 5.25);

			//Add some text
			var Textframe2 = AddTextframe (10, 10, 100, 80, "");
			var Werbetext = "Hallo " + ClientSalutation + " " + ClientLastname + ",\r\r";
			Werbetext += "noch nie war es sinnvoller, sich selbst eine Postkarte zu schreiben!\r\rAlles was Sie hier lesen ist eine reine Werbemaßnahme, speziell und nur für Sie, " + ClientSalutation + " " + ClientLastname + "! Ist das nicht der Hammer?";
			Werbetext += "\r\rStellen Sie sich mal vor, Sie geben in ein Webinterface etwas ein und sofort nach dem Abschicken erstellt Adobe InDesign daraus ein echtes Layout.";
			Werbetext += "\r\rDieses Prinzip nennt sich übrigens Database Publishing und man kann damit zum Beispiel Web-To-Print machen... so nebenbei. Oder wie wäre es mit beliebigen Drucksachen? Die Grenzen bestimmen dabei nur Sie.";
			Werbetext += "\r\rInteresse? Wir beraten Sie gerne.\rSchreiben Sie uns einfach eine E-Mail an info@dbui.de\nund wir kommen in's Gespräch.";
			Werbetext = AppendTextToTextframe (Textframe2, Werbetext);
			Werbetext.fillColor = app.activeDocument.swatches.item("Black");
			Werbetext.appliedFont = "Arial";
			Werbetext.pointSize = 9;
			Werbetext.appliedLanguage = "German: 2006 Reform";

			//Add address block
			var Textframe3 = AddTextframe (135, 45, 50, 50, "");
			var Addressblock = ClientSalutation + "\r" + ClientFirstname + " " + ClientLastname + "\r" + ClientCompany + "\r" + ClientStreetname + "\r" + ClientZIP + " " + ClientCity + "\r" + ClientCountry;
			Addressblock = AppendTextToTextframe (Textframe3, Addressblock);
			Addressblock.fillColor = app.activeDocument.swatches.item("Black");
			Addressblock.appliedFont = "Arial";
			Addressblock.pointSize = 10;
			Addressblock.appliedLanguage = "German: 2006 Reform";

			//Place a textbox snippet and fill its content with text
			var MyTeaserBox = PlaceSnippet("/D/dbui/images/TeaserSnippet.idms", 65, 50);
			var TeaserText = "Beratungsgutschein für\r" + ClientFirstname + " " + ClientLastname + "!";
			MyTeaserBox[0].contents = TeaserText;

			//Save the InDesign file to the output folder
			app.activeDocument.save(new File("/Y/" + TempDocName + ".indd"));
			//app.activeDocument.close();

			//Export a PDF to the output folder, then close without saving
			app.activeDocument.exportFile(ExportFormat.pdfType, new File("/Y/" + TempDocName + ".pdf"), false);
			app.activeDocument.close(SaveOptions.no);

			//Finally set the status to "completed" in the database
			ConnectToDatabase("UPDATE Production.OrderDetails SET Status='completed' WHERE ID = '" + CurrentJobID + "'");

			//Resetting array
			CurrentJobOrder = "";
		}
		catch(e){
			//Errors while publishing should be logged in database
			//alert(e + FunctionName);
			ConnectToDatabase("UPDATE Production.OrderDetails SET Status='ERROR! " + e + FunctionName + "' WHERE ID = '" + CurrentJobID + "'");
		}
	}
	//Next product here...

}
