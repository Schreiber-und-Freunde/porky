/*
  porky
  JavaScript productivity extension library with database access for Adobe InDesign
  (c)2009 - 2015 Dipl.-Ing. (FH) Oliver Grünberg
  www.porky.io

  Include this file in your JSX scripts before anything else 
  #include ../yourPathToPorky/porky.jsx;
  The file porky-data-source-acces.js must be launched with the Node.Js interpreter.
  Through porky-data-source-acces.js it is possible for porky.jsx to get access to external data sources.
  The file porky.jsx provides extended layout functionality and access to data sources.

  Start porky data source access via commandline
  node porky-data-source-access.js

  Quit porky data source access via web browser
  http://127.0.0.1:6789/cXVpdCBwb3JreQo=
*/


function porkyDataSourceAccess(){

    var net = require('net');
    var fs = require('fs');
    var path = require('path');
    var request = require('request');
    var sqlite3 = require('sqlite3').verbose();
    var mysql = require('mysql');
    var parseString = require('xml2js').parseString;
    var htmlparser = require('htmlparser');
    var markdown = require( "markdown" ).markdown;
    var brucedown = require('brucedown');
    var Entities = require('html-entities').AllHtmlEntities;



    // Creating server instance
    net.createServer(function(sock) {

        console.log('\nClient connected');

        // Adding data event handler to socket
        sock.on('data', function(data) {

            console.log('\nRequest from client sock.address().address:sock.address().port ' + sock.address().address + ':' + sock.address().port);
            console.log('\nraw utf8');
            console.log('\n' + data.toString('utf8'));

            var dataChunk = data.toString('utf8').split(' ');
            var requestUTF8 = '';
            var requestBase64 = '';

            if(dataChunk.length > 1){
                // Remove / at beginning
                if(dataChunk[1].substring(0, 1) == '/') {
                    dataChunk[1] = dataChunk[1].substring(1, dataChunk[1].length);
                }

                // Convert request to plain utf8
                requestUTF8 = new Buffer(dataChunk[1], 'base64').toString('utf8');

                // Checking for shutdown request
                if(requestUTF8 == 'quit porky' || requestUTF8 == 'quit porky\n'){
                    console.log('\nShutdown request received');
                    console.log('\nQuitting porky socket server (process.pid=' + process.pid + ')\n');
                    process.kill(process.pid);
                }
            }else{
                // Proceeding
                requestBase64 = new Buffer(data, 'base64').toString('utf8');
                requestUTF8 = new Buffer(requestBase64, 'base64').toString("utf8");
            }

            console.log('\nbase64 decoded');
            console.log('\n' + requestUTF8);

            // Convert GET request to JSON
            var getRequestJSON;
            try{
                getRequestJSON = JSON.parse(requestUTF8, true);
            }catch(e){
                console.log('\nError on JSON.parse() client request, invalid JSON: ' + e);
                //sock.write('');
                sock.end();
                return;
            }

            // Extracting values from JSON and fill variables
            var dataSourceType = getRequestJSON.porky.dataSourceType;
            var dataSourceServer = getRequestJSON.porky.dataSourceServer;
            var dataSourceName = getRequestJSON.porky.dataSourceName;
            var dataSourceUsername = getRequestJSON.porky.dataSourceUsername;
            var dataSourcePassword = getRequestJSON.porky.dataSourcePassword;
            var dataSourceQuery = getRequestJSON.porky.dataSourceQuery;

            var chunkDataCollection = '';

            // Request a remote data source
            if(dataSourceType == 'JSON'){            
                request({
                    method: 'GET',
                    uri: dataSourceServer + dataSourceName,
                    gzip: false
                },
                function (error, response, body) {
                    // console.log(response.headers['content-encoding'])
                    // console.log(body)
                }).on('response', function(response) {
                    console.log('\nQuerying dataSourceServer + dataSourceName');
                    response.on('data', function(data) {
                        console.log('\nReceived data chunk: ' + data.length + ' bytes');
                        chunkDataCollection += data;
                    });
                }).on('end', function(data) {
                    socketWriteResult(chunkDataCollection);
                });
            }

            if(dataSourceType == 'SQLite'){
                var db;
                if (fs.existsSync(dataSourceName + dataSourceServer)) {
                    // Database file exists
                    // Load it
                    console.log('Using database: ' + dataSourceName + dataSourceServer);
                    db = new sqlite3.Database(dataSourceName + dataSourceServer);
                }else {
                    // Database file does not exist
                    // Do nothing
                    console.log('Error: database file \'' + dataSourceName + dataSourceServer + '\' does not exist');
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

            if(dataSourceType == 'MySQL'){

                    var connection = mysql.createConnection({
                        database : dataSourceName,
                        host     : dataSourceServer,
                        user     : dataSourceUsername,
                        password : dataSourcePassword
                    });

                    connection.connect();
                    connection.query(dataSourceQuery, function(err, rows, fields) {
                        if (err){
                            console.log('\nError: Uncool connection!');
                            console.log(err);
                            sock.end();
                            return;
                        }

                        // Return result
                        chunkDataCollection = JSON.stringify(rows);

                        socketWriteResult(chunkDataCollection);

                    });

                    connection.end();
                    

            }

            if(dataSourceType == 'XML'){
                request({
                    method: 'GET',
                    uri: dataSourceServer + dataSourceName,
                    gzip: false
                },
                function (error, response, body) {
                    // console.log(response.headers['content-encoding'])
                    // console.log(body)
                }).on('response', function(response) {
                    console.log('\nQuerying dataSourceServer + dataSourceName');
                    response.on('data', function(data) {
                        console.log('\nReceived data chunk: ' + data.length + ' bytes');
                        chunkDataCollection += data;
                    });
                }).on('end', function(data) {
                    //xml2js
                    parseString(chunkDataCollection, function (err, result) {
                        // Entire result
                        chunkDataCollection = JSON.stringify(result);
                        // Parse result with dataSourceQuery
                        if(dataSourceQuery !== ''){
                            try{
                                // e.g. using the object entireResult in combination with a passed over JSON path in dot notation '.rss.channel[0].title'
                                var entireResult = JSON.parse(chunkDataCollection);
                                chunkDataCollection = JSON.stringify( eval('entireResult' + dataSourceQuery) );
                            }catch(e){
                                console.log('\nError evaluating \'' + dataSourceQuery + '\'');
                                console.log('\n' + e);
                                sock.end();
                                return;
                            }
                        }

                        console.log('\n' + chunkDataCollection);
                        socketWriteResult(chunkDataCollection);
                    });
                });
            }

            if(dataSourceType == 'htmlToJSON' || dataSourceType == 'markdownToJSON'){
                if(dataSourceType == 'markdownToJSON'){
                    console.log('\nmarkdown parsing done, creating temporary HTML');

                    // in any case: dataSourceQuery content is forced to be HTML 
                    dataSourceQuery = markdown.toHTML(dataSourceQuery);
                }

                var handler = new htmlparser.DefaultHandler(function (error, dom) {
                    if (error){
                        console.log('\nError while parsing html');
                        sock.end();
                        return;
                    }else{
                        console.log('\nhtml parsing done, creating JSON');
                        chunkDataCollection = JSON.stringify(dom);
                        console.log(chunkDataCollection);
                        socketWriteResult(chunkDataCollection);
                    }
                });

                var parser = new htmlparser.Parser(handler);
                parser.parseComplete(dataSourceQuery);
                // sys.puts(sys.inspect(handler.dom, false, null));
            }

            if(dataSourceType == 'markdownToHTML'){
                var entities = new Entities();
                brucedown(dataSourceQuery, function (err, dom) {
                    chunkDataCollection = JSON.stringify({'html':entities.decode(dom)});
                    console.log(chunkDataCollection);
                    socketWriteResult(chunkDataCollection);
                });
            }



            if(dataSourceType != "SQLite" && dataSourceType != "MySQL" && dataSourceType != "XML" && dataSourceType != "JSON" && dataSourceType != "htmlToJSON" && dataSourceType != "markdownToJSON" && dataSourceType != "markdownToHTML"){
                console.log('\nError: dataSourceType [' + dataSourceType + '] is not supported');
                sock.end();
                return;
            }

        });

        // Adding close event handler to this instance of socket
        sock.on('close', function(data) {
            console.log('\nConnection closed');
            console.log('\n**************************************************************\n');
        });





        // Writing results to client
        function socketWriteResult(chunkDataCollection){
            var resultAllJSON = '';
            var resultBase64 = '';
            // Validating via JSON.parse()
            try{
                resultAllJSON = JSON.parse(chunkDataCollection);
            }catch(e){
                console.log("\nError while parsing result!");
                resultAllJSON = '';
                console.log('Empty result should be [] not nothing!');
            }

            // Stringifying and base64 encoding before sending
            resultAllJSON = JSON.stringify(resultAllJSON);
            resultBase64 = new Buffer(resultAllJSON).toString('base64');

            console.log('\nSending stringified & base64 encoded JSON to client');
            console.log('\n' + resultAllJSON);

            sock.write(resultBase64);
            sock.end();
        }

    }).listen(6789, '127.0.0.1');

    console.log('\n**********************************\nporky data source access interface\n**********************************\n');

}

porkyDataSourceAccess();
