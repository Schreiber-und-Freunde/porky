/*
    porky
    JavaScript productivity extension library with database access for Adobe InDesign
    (c)2009 - 2015 Dipl.-Ing. (FH) Oliver Grünberg
    www.porky.io

    Include this file in your JSX scripts before anything else 
    //@include ../yourPathToPorky/porky.jsx;
    The file porky-data-source-acces.js must be launched with the Node.Js interpreter.
    Through porky-data-source-acces.js it is possible for porky.jsx to get access to external data sources.
    The file porky.jsx provides extended layout functionality and access to data sources.

    Start porky data source access via commandline
    node porky-data-source-access.js

    Quit porky data source access via web browser
    http://127.0.0.1:6789/cXVpdCBwb3JreQo=
*/

var net = require('net');
var fs = require('fs');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var mysql = require('mysql');
var parseString = require('xml2js').parseString;
var htmlparser = require('htmlparser');
var markdown = require('markdown').markdown;
var brucedown = require('brucedown');
var Entities = require('html-entities').AllHtmlEntities;
var node_xj = require("xls-to-json");


function porkyDataSourceAccess() {
    // Creating server instance
    net.createServer(function (sock) {
        // console.log('\nClient connected');
        // Adding data event handler to socket
        sock.on('data', function (data) {
            // console.log('\nRequest from client sock.address().address:sock.address().port ' + sock.address().address + ':' + sock.address().port);
            // console.log('\nraw utf8');
            // console.log('\n' + data.toString('utf8'));
            var dataChunk = data.toString('utf8').split(' ');
            var requestUTF8 = '';
            var requestBase64 = '';

            if (dataChunk.length > 1) {
                // Remove / at beginning
                if (dataChunk[1].substring(0, 1) === '/') {
                    dataChunk[1] = dataChunk[1].substring(1, dataChunk[1].length);
                }

                // Convert request into plain utf8
                requestUTF8 = new Buffer(dataChunk[1], 'base64').toString('utf8');

                // Checking for shutdown request
                if (requestUTF8 === 'quit porky' || requestUTF8 === 'quit porky\n') {
                    console.log('\nShutdown request received');
                    console.log('\nQuitting porky data source access interface (process.pid=' + process.pid + ')\n');
                    process.kill(process.pid);
                }
            } else {
                // More than 1 dataChunk: proceeding
                requestBase64 = new Buffer(data, 'base64').toString('utf8');
                requestUTF8 = new Buffer(requestBase64, 'base64').toString('utf8');
            }

            // console.log('\nbase64 decoded');
            // console.log('\n' + requestUTF8);
            // Parsing GET request: result is JSON
            var getRequestJSON;
            try {
                getRequestJSON = JSON.parse(requestUTF8, true);
            } catch (e) {
                console.log('\nError on JSON.parse() client request, invalid JSON: ' + e);
                //sock.write('');
                sock.end();
                return;
            }

            // Extracting values from JSON into variables
            var dataSourceType = getRequestJSON.porky.dataSourceType;
            var dataSourceServer = getRequestJSON.porky.dataSourceServer;
            var dataSourceName = getRequestJSON.porky.dataSourceName;
            var dataSourceUsername = getRequestJSON.porky.dataSourceUsername;
            var dataSourcePassword = getRequestJSON.porky.dataSourcePassword;
            var dataSourceQuery = getRequestJSON.porky.dataSourceQuery;

            var paths;
            try {
                paths = dataSourceQuery.split('.');
            }catch(e){
                console.log('\nError on JSON.parse() client request, invalid dataSourceQuery: ' + e);
                //sock.write('');
                sock.end();
                return;
            }
            var chunkDataCollection = '';
            var tempJSONObject = '';



            // JSON data source access, local or remote
            if (dataSourceType === 'JSON') {
                console.log('\nQuerying dataSourceServer + dataSourceName');
                if ((dataSourceServer + dataSourceName).substring(0, 7) === 'http://' || (dataSourceServer + dataSourceName).substring(0, 8) === 'https://') {
                    request({
                        method: 'GET',
                        uri: dataSourceServer + dataSourceName,
                        gzip: false
                    }, function () {
                        // (error, response, body)
                        // console.log(response.headers['content-encoding']);
                        // console.log(response.headers);
                    }).on('response', function (response) {
                        response.on('data', function (data) {
                            console.log('\nReceived data chunk: ' + data.length + ' bytes');
                            chunkDataCollection += data;
                        });
                    }).on('end', function () {
                        console.log('\nGot all chunks, starting to process result');
                        processJSON(chunkDataCollection);
                    }).on('error', function (error) {
                        console.log('\n' + error);
                        sock.end();
                        return;
                    });
                } else {
                    fs.readFile(dataSourceServer + dataSourceName, 'utf8', function (err, data) {
                        if (!err) {
                            processJSON(data);
                        } else {
                            console.log('\n' + err);
                            sock.end();
                            return;
                        }
                    });
                }
            }



            // XML data source access, local or remote
            if (dataSourceType == 'XML') {
                console.log('\nQuerying dataSourceServer + dataSourceName');
                if ((dataSourceServer + dataSourceName).substring(0, 7) === 'http://' || (dataSourceServer + dataSourceName).substring(0, 8) === 'https://') {
                    request({
                        method: 'GET',
                        uri: dataSourceServer + dataSourceName,
                        gzip: false
                    }, function() {
                        //(error, response, body)
                        // console.log(response.headers['content-encoding'])
                        // console.log(body)
                    }).on('response', function(response) {
                        response.on('data', function(data) {
                            console.log('\nReceived data chunk: ' + data.length + ' bytes');
                            chunkDataCollection += data;
                        });
                    }).on('end', function() {
                        console.log('\nGot all chunks, starting to process result');
                        parseString(chunkDataCollection, function(err, result) {
                            processJSON(JSON.stringify(result));
                        });
                    }).on('error', function(error) {
                        console.log('\n' + error);
                        sock.end();
                        return;
                    });
                } else {
                    fs.readFile(dataSourceServer + dataSourceName, 'utf8', function(err, data) {
                        if (!err) {
                            // console.log(data);
                            parseString(data, function(err, result) {
                                processJSON(JSON.stringify(result));
                            });
                        } else {
                            console.log('\n' + err);
                            sock.end();
                            return;
                        }
                    });
                }
            }


            // SQLite local database file access
            if (dataSourceType == 'SQLite') {
                var db;
                if (fs.existsSync(dataSourceName + dataSourceServer)) {
                    // Database file exists
                    // Load it
                    console.log('\nUsing database: ' + dataSourceName + dataSourceServer);
                    db = new sqlite3.Database(dataSourceName + dataSourceServer);
                } else {
                    // Database file does not exist
                    // Do nothing
                    console.log('\nError: database file \'' + dataSourceName + dataSourceServer + '\' does not exist');
                    sock.end();
                    return;
                }
                db.serialize(function() {
                    db.all(dataSourceQuery, function(err, rows) {
                        // Return result
                        chunkDataCollection = JSON.stringify(rows);
                        socketWriteResult(chunkDataCollection);
                    });
                });
                db.close();
            }


            // MySQL server database access
            if (dataSourceType == 'MySQL') {
                var connection = mysql.createConnection({
                    database: dataSourceName,
                    host: dataSourceServer,
                    user: dataSourceUsername,
                    password: dataSourcePassword
                });
                connection.connect();
                connection.query(dataSourceQuery, function(err, rows) {
                    //(err, rows, fields)
                    if (err) {
                        console.log('\nError: Uncool connection!');
                        console.log('\n' + err);
                        connection.end();
                        sock.end();
                        return;
                    }
                    // Return result
                    chunkDataCollection = JSON.stringify(rows);
                    connection.end();
                    socketWriteResult(chunkDataCollection);
                });

                //connection.end();            

            }



            // HTML to JSON conversion
            // Markdown to JSON conversion
            if (dataSourceType == 'htmlToJSON' || dataSourceType == 'markdownToJSON') {
                if (dataSourceType == 'markdownToJSON') {
                    console.log('\nmarkdown parsing done, creating temporary HTML');
                    dataSourceQuery = markdown.toHTML(dataSourceQuery);
                }
                // in any case: dataSourceQuery content is HTML 
                var handler = new htmlparser.DefaultHandler(function(error, dom) {
                    if (error) {
                        console.log('\nError while parsing HTML');
                        sock.end();
                        return;
                    } else {
                        console.log('\nHTML parsing done, creating JSON');
                        chunkDataCollection = JSON.stringify(dom);
                        // console.log(chunkDataCollection);
                        socketWriteResult(chunkDataCollection);
                    }
                });
                var parser = new htmlparser.Parser(handler);
                parser.parseComplete(dataSourceQuery);
                // sys.puts(sys.inspect(handler.dom, false, null));
            }


            // Markdown to HTML conversion
            if (dataSourceType == 'markdownToHTML') {
                var entities = new Entities();
                brucedown(dataSourceQuery, function(err, dom) {
                    chunkDataCollection = JSON.stringify({
                        'html': entities.decode(dom)
                    });
                    console.log('\nmarkdown parsing done, creating HTML');
                    // console.log(chunkDataCollection);
                    socketWriteResult(chunkDataCollection);
                });
            }


            // Excel to JSON conversion
            if (dataSourceType == 'excelToJSON') {
                var tempExcelFile = dataSourceName + dataSourceServer;

                if (fs.existsSync(tempExcelFile)) {
                    // Database file exists
                    // Load it
                    console.log('\nUsing Excel file: ' + tempExcelFile);

                    node_xj({
                        input: tempExcelFile, // Input Excel file
                        sheet: dataSourceQuery, // Input sheetname
                        output: null // Output JSON file
                    }, function(err, result) {
                        if(err) {
                            console.log(err);
                            sock.end();
                            return;
                        } else {
                            // Return result
                            chunkDataCollection = JSON.stringify(result);
                            socketWriteResult(chunkDataCollection);
                        }
                    });

                } else {
                    // Excel file does not exist
                    // Do nothing
                    console.log('\nError: Excel file \'' + tempExcelFile + '\' does not exist');
                    sock.end();
                    return;
                }






            }


            // Client console.log
            if (dataSourceType == 'consoleLog') {
                dataSourceQuery = dataSourceQuery.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ');
                console.log('\n    Client console.log()' + '\n    Timestamp: ' + Date.now() + '\n    Message: ' + dataSourceQuery);
                sock.write(new Buffer('true').toString('base64'));
                sock.end();
            }


            // if dataSourceType is not supported
            if (dataSourceType != 'SQLite' && dataSourceType != 'MySQL' && dataSourceType != 'XML' && dataSourceType != 'JSON' && dataSourceType != 'htmlToJSON' && dataSourceType != 'markdownToJSON' && dataSourceType != 'markdownToHTML'  && dataSourceType != 'excelToJSON' && dataSourceType != 'consoleLog') {
                console.log('\nError: dataSourceType \'' + dataSourceType + '\' is not supported');
                sock.end();
                return;
            }


            // Helper functions
            // Deep finding JSON in path and processing the result
            function processJSON(jsonString) {
                // Parse result with dataSourceQuery
                if (dataSourceQuery !== '') {
                    console.log('\nTrying to deep find {Object}.' + dataSourceQuery);
                    try {
                        // e.g. using the object tempJSONObject in combination with a passed over JSON path in dot notation 'rss.channel.0.title'
                        tempJSONObject = JSON.parse(jsonString);
                        // jsonString = JSON.stringify( eval('tempJSONObject' + dataSourceQuery) );
                        for (var jsonPath = 0; jsonPath < paths.length; jsonPath++) {
                            tempJSONObject = tempJSONObject[paths[jsonPath]];
                        }
                        jsonString = JSON.stringify(tempJSONObject);
                    } catch (e) {
                        console.log('\nError evaluating \'' + dataSourceQuery + '\'');
                        console.log('\n' + e);
                        sock.end();
                        return;
                    }
                }
                console.log('\nGot JSON...');
                socketWriteResult(jsonString);
            }


            // Writing results to client
            function socketWriteResult(chunkDataCollection) {
                var resultAllJSON = '';
                var resultBase64 = '';
                // Validating via JSON.parse()
                try {
                    resultAllJSON = JSON.parse(chunkDataCollection);
                } catch (e) {
                    resultAllJSON = '';
                    console.log('\nError while parsing empty result!');
                    console.log('\nResult should be [] not nothing!');
                }
                // Stringifying and base64 encoding before sending
                resultAllJSON = JSON.stringify(resultAllJSON);
                resultBase64 = new Buffer(resultAllJSON).toString('base64');
                console.log('\nWriting JSON result to client socket...');
                // console.log('\nSending stringified & base64 encoded JSON to client');
                // console.log('\n' + resultAllJSON);
                sock.write(resultBase64);
                sock.end();
            }
        });


        // Adding close event handler to this instance of socket
        sock.on('close', function() {
            console.log('\n---');
        });

    }).listen(6789, '127.0.0.1');

    console.log('\n**************************************\n* porky data source access interface *\n**************************************\n');
}

porkyDataSourceAccess();