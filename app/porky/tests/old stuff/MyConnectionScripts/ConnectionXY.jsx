#include ../../AdminScripts/DBUILoader.jsx;

//Make sure that the value of the attribute "DBUITagUpdateIdentifier" of the corresponding XML tag gets loaded correctly
//var DBUITagUpdateIdentifier = "Hello World!";
ConnectToDatabase("SELECT Col1, Col2 FROM Production.Testtable WHERE Col1 ='" + DBUITagUpdateIdentifier +"'");
