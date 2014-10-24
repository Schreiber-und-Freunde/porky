# porky

## porky is a JavaScript extension for Adobe InDesign and other Adobe products supporting ExtendScript

With porky you
* automize workflows
* code what computers are ment to do and not humans
* add safety to recurring tasks
* code less
* connect to databases
* extend the possibilities of Adobe's ExtendScript



Please check the product website http://porky.io for code examples.

Documentation available unter http://porky.io/documentation/

Sample PHP socket server for handling SQLite and XML sources available in src/bin

## 30 seconds super simple installation

## OS-X
* Download this projekt and unzip the archive into your Adobe InDesign Scripts Panel folder
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
- extension=php_xmlrpc.dll
- ... and of course you have to load all dlls for extra database support, too!
* In the InDesign Scripts Panel double click the script located at /src/start-porky-data-source-access.jsx
* Create a new InDesign layout document and start playing with the examples
* Now: have fun and create workflows!
