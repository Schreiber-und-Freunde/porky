# porky

porky is not maintained anymore. 

## porky is a JavaScript extension for Adobe InDesign and other Adobe products supporting ExtendScript

With porky you
* automize workflows
* code what computers are meant to do and not humans
* add safety to recurring tasks
* code less
* connect to databases and various other data sources (SQL, XML, JSON, CSV, ...)
* synchronize your layout by pushing a button
* extend the possibilities of Adobe's ExtendScript
* code completely in JavaScript



Please check the product website http://porky.io for code examples!


* Documentation available unter http://porky.io/documentation/
* Sample node.js socket server for handling MySQL, SQLite, JSON and XML sources available in src/bin



We also offer custom InDesign panel integration of porky and automation workflow consulting!

For details please contact us via anfrage@schreiber-freunde.de


## 60 seconds super simple installation

## OS-X
* Download this projekt and unzip the archive into your Adobe InDesign Scripts Panel folder
* porky requires Node.js installed, so download and install the latest version from https://nodejs.org
* In order to run correctly, porky needs the following npm modules to be installed:
  - request, sqlite3, mysql, pg, xml2js, htmlparser, markdown, brucedown and html-entities
  - navigate via terminal to the porky project folder on your file system where the file package.json is located and enter 'npm install'
  - all necessary dependencies will be installed automatically
* Start Adobe InDesign
* In the InDesign Scripts Panel double click the script located at /src/start-porky-data-source-access.jsx, now you have access to various data sources
* Create a new InDesign layout document and start playing with the examples
* Now: have fun and create workflows!

## Windows
* porky requires Node.js installed, so download and install the latest version from https://nodejs.org
* for the rest see: OS-X installation
* it might be necessary to set the system variable NODE\_PATH correctly so it points to the folder node\_modules and Node can find its installed packages


## Changelog
Version 0.3.6 (2015-06-09)
* improves error handling for ESTK part of lib

Version 0.3.5 (2015-05-29)
* improves error handling in syncXMLElement(), code cleanup

Version 0.3.5 (2015-05-27)
* code cleanup, integrates latest JSON-js library, replaces json_parse() with JSON.parse()

Version 0.3.4 (2015-05-26)
* bugfix processJSON() parameter for local XML files

Version 0.3.3 (2015-05-22)
* adds support for local XML and JSON files
* code cleanup

Version 0.3.2 (2015-05-08)
* fixes image download bug in placeHTML()
* adds placeHTML() example script
* cleans up include directive from #include to //@include to ease JSLint
* changes placeholder image in createPlaceholderImage() to porky logo
* adds possibility in createPlaceholderImage() to chose a target folder

Version 0.3.1 (2015-04-28)
* adds console.log() features to Adobe ExtendScript Toolkit (ESTK)
* code clean up

Version 0.3.0 (2015-04-20)
* code base (data source access side) completely ported to Node.Js
* adds new functionality
  * placeholderToInlineImage(targetObject, localImageFolder, downloadImage, httpSourcePort)
  * placeHTML(targetObject, htmlText, inlineStyles, blockStyles)
  * writeFile(fullFilePath, fileContent, lineEnding)
  * readFile(fullFilePath)
  * csvToTwoDArray(csvString, splittingOptions)
  * adds new dataSource.type markdownToHTML
  * adds new dataSource.type markdownToJSON

Version 0.2.3 (2015-03-30)
* extends tagThis() support for text selection inside of table cells

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
