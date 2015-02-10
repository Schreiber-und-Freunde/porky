# porky

[![Analytics](https://ga-beacon.appspot.com/UA-26401744-7/porky/)](https://github.com/Schreiber-und-Freunde/porky)

## porky is a JavaScript extension for Adobe InDesign and other Adobe products supporting ExtendScript

With porky you
* automize workflows
* code what computers are ment to do and not humans
* add safety to recurring tasks
* code less
* connect to databases
* synchronize your layout by pushing a button
* extend the possibilities of Adobe's ExtendScript



Please check the product website http://porky.io for code examples!

* Documentation available unter http://porky.io/documentation/
* Sample PHP socket server for handling MySQL, SQLite and XML sources available in src/bin

## 30 seconds super simple installation

## OS-X
* Download this projekt and unzip the archive into your Adobe InDesign Scripts Panel folder
* Start Adobe InDesign
* In the InDesign Scripts Panel double click the script located at /src/start-porky-data-source-access.jsx
* Create a new InDesign layout document and start playing with the examples
* Now: have fun and create workflows!

## Windows
* Download this projekt and unzip the archive into your Adobe InDesign Scripts Panel folder
* Download php binaries (e.g. from http://windows.php.net/download/)
* Unpack its content into "your-Adobe-InDesign-Scripts-Panel-folder/porky/src/bin/php-win/"
* Setup php.ini correctly – use the existing one for testing or create a new one for production
- Be sure to uncomment the following settings in php.ini:
- extension_dir = "ext"
- extension=php_sockets.dll
- extension=php_sqlite3.dll
- extension=php_pdo_sqlite.dll
- extension=php_pdo_mysql.dll
- extension=php_xmlrpc.dll
- ... and of course you have to load all dlls for extra database support, too!
* Start Adobe InDesign
* In the InDesign Scripts Panel double click the script located at /src/start-porky-data-source-access.jsx
* Create a new InDesign layout document and start playing with the examples
* Now: have fun and create workflows!


## Changelog
Version 0.2.2 (2014-12-08)
* adds new function fitTextboxHeightAndThread()

Version 0.2.1 (2014-12-01)
* fixes bug for dataSourceType = JSON, returns correctly parsed JSON object

Version 0.2.0 (2014-11-26)
* adds htmlToJSON as new dataSource.type
* adds httpGetBinaryFile()
* fixes syncXMLElement()
* adds modifyFrame()

Version 0.1.9 (2014-10-31)
* adds syncing feature …

Version 0.1.8 (2014-10-30)
* adds function setSyncIdentifier()

Version 0.1.7 (2014-10-29)
* fixes sync bug returning var assXMLElem = null

Version 0.1.6 (2014-10-27)
* adds MySQL support

Version 0.1.6 (2014-10-24)
* adds windows compatible version

Version 0.1.5 (2014-10-08)
* adds info in Windows launcher script

Version 0.1.4 (2014-09-24)
* fixes wrong variable declaration in example script

Version 0.1.3 (2014-09-18)
* fixes relative/fixed path

Version 0.1.2 (2014-09-17)
* fixes relative path in sync scripts
* renames tests to samples and cleans up
* removes copyright
* folder cleanup
* code review
* adds license
* adds license and link to documentation
* ixes correct if/else …

Version 0.1.1 (2014-09-15)
* adds grunt
* Changes identing, adds grunt

Version 0.1.0 (2014-09-11)
* fixes fitting issue in fitTextboxHeightToContent()
