# porky

## porky is a JavaScript extension for Adobe InDesign

With porky you
* automize workflows
* code what computers are ment to do and not humans
* code less
* add safety to recurring tasks
* extend the possibilities of Adobe's ExtendScript
* connect to databases


Some code examples

### connectToDataSource (dataSourceQuery)

```javascript
// XML data source to JSON conversion tests
dataSourceType = 'XML';
dataSourceName = 'http://weather.yahooapis.com/forecastrss?w=12835979″;
var myXMLResult = connectToDataSource('//channel');//enter XPath here
alert(myXMLResult);

myXMLResult = json_parse(myXMLResult);
myXMLResult = myXMLResult[0].item.description;
alert( JSON.stringify(myXMLResult) );

// Or how about requesting a SQLite database
var thisParentFolder = File($.fileName).parent;
var thisRootFolder = File('~').fsName;
var thisAbsolutePath = unescape( thisParentFolder.toString().replace('~', thisRootFolder) );
alert(thisAbsolutePath);
// GLOBAL VARIABLES
dataSourceType = 'SQLite';
dataSourceServer = '-';
dataSourceName = thisAbsolutePath + '/database.sqlite';
dataSourceUsername = '-';
dataSourcePassword = '-';
var mySQLiteResult = '';
mySQLiteResult = connectToDataSource('SELECT * FROM evenmorerows LIMIT 1000,1″);

/*
mySQLiteResult = connectToDataSource('SELECT COUNT(ClientLastname) AS ZAEHLER FROM MyTable');
mySQLiteResult = connectToDataSource('SELECT * FROM MyTable');
mySQLiteResult = connectToDataSource('UPDATE MyTable SET ClientLastname=’Möller’ WHERE ClientLastname=’Müller’');
mySQLiteResult = connectToDataSource('SELECT MyOtherTable.ClientFirstname, MyTable.ClientLastname FROM MyTable, MyOtherTable');
mySQLiteResult = connectToDataSource('CREATE TABLE byebye(Spalte1 varchar(256), Spalte2 varchar(256), Spalte3 INT)');
mySQLiteResult = connectToDataSource('INSERT INTO byebye (Spalte1, Spalte2, Spalte3) VALUES (‘hallo’, ‘oli’, ‘ü’)');
mySQLiteResult = connectToDataSource('SELECT * FROM byebye');
mySQLiteResult = connectToDataSource('DELETE FROM byebye WHERE(Spalte3=’ü’)');
mySQLiteResult = connectToDataSource('ALTER TABLE byebye ADD Zeitstempel TIMESTAMP');
mySQLiteResult = connectToDataSource('SELECT name FROM sqlite_master');
mySQLiteResult = connectToDataSource('PRAGMA table_info(byebye)');
mySQLiteResult = connectToDataSource('DROP TABLE byebye');
*/

alert('This comes from the database\n' + mySQLiteResult);
mySQLiteResult = json_parse(mySQLiteResult);
mySQLiteResult = mySQLiteResult[0].col7;
alert('Accessing keys directly is possible!\n' + mySQLiteResult);
```

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |

