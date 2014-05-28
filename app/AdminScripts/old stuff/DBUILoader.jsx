/*
DBUI LOADER
(c) 2009 - 2012 Oliver Grünberg
www.DBUI.de
*/

//loading DBUIConnector as jsxbin once, because it ist not directly includable!
//hardcoded target is Adobe InDesign
app.doScript(File(File($.fileName).parent.absoluteURI + "/DBUIConnector.jsxbin" ), ScriptLanguage.javascript);


//you can already test your database connection here :-)
/*
SQLDatabaseType = "MySQL";
SQLDatabaseName = "Production";
SQLServerAddress = "192.168.2.102";
SQLUsername = "YourUsername";
SQLPassword = "YourPassword";
DBUILogFileOutput = "show";

var TestResult = ConnectToDatabase("SELECT * FROM Production.Test LIMIT 10");
alert(TestResult);
*/