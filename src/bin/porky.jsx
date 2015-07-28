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

// Including external libraries
//@include ../lib/json-js/json2.js
//@include ../lib/base64/base64-encode-decode.js


// Global objects
settings = {
    dataSource: {
        type: '',
        server: '',
        name: '',
        username: '',
        password: ''
    },
    sync: {
        scriptFolder: '',
        identifier: ''
    }
};
console = {};


// Enabling console.log() output for Extend Script Tool Kit
console.log = function (message) {
    if (typeof(message) == 'object') {
        message = message.toSource();
    }
    message = message.toString();
    var consoleRequest = JSON.stringify({
        'porky': {
            'dataSourceType': 'consoleLog',
            'dataSourceServer': '',
            'dataSourceName': '',
            'dataSourceUsername': '',
            'dataSourcePassword': '',
            'dataSourceQuery': message
        }
    });
    consoleRequest = Base64.encode(consoleRequest);
    var consoleReply = '';
    var consoleConnection = new Socket();
    consoleConnection.timeout = 600000;
    if (consoleConnection.open('127.0.0.1:6789', 'UTF-8')) {
        consoleReply = consoleConnection.write('GET /' + consoleRequest + ' HTTP/1.0\n\n');
        consoleReply = consoleConnection.read(99999999999);
        consoleConnection.close();
        if (consoleReply.length > 0) {
            consoleReply = Base64.decode(consoleReply);
        } else {
            return false;
        }
    } else {
        $.writeln(message);
    }
    return true;
};


// porky data source access
function connectToDataSource(dataSourceQuery) {
    var getRequest = JSON.stringify({
        'porky': {
            'dataSourceType': settings.dataSource.type,
            'dataSourceServer': settings.dataSource.server,
            'dataSourceName': settings.dataSource.name,
            'dataSourceUsername': settings.dataSource.username,
            'dataSourcePassword': settings.dataSource.password,
            'dataSourceQuery': dataSourceQuery
        }
    });
    // {'porky': {'dataSourceType': 'SQLite','dataSourceServer': '127.0.0.1','dataSourceName': 'TestDatabase','dataSourceUsername': 'Oliver','dataSourcePassword': '1234','dataSourceQuery': 'SELECT * FROM bla'}}

    var getRequestBase64 = Base64.encode(getRequest);
    var reply = '';
    var conn = new Socket();
    conn.timeout = 600000;
    if (conn.open('127.0.0.1:6789', 'UTF-8')) {
        // send a HTTP GET request
        var result = conn.write('GET /' + getRequestBase64 + ' HTTP/1.0\n\n');
        // and read the server’s reply
        console.log('Receiving response...');
        reply = conn.read(99999999999);
        var close = conn.close();
    } else {
        alert('Warning\nCannot establish porky data source access!');
        exit(0);
    }
    if (reply.length > 0) {
        //decode reply from base64
        reply = Base64.decode(reply);
        return reply;
    }
}



// porky core functions for Adobe InDesign

function addFrame(xFrame, yFrame, wFrame, hFrame, stringOrFile) {
    try{
        var tempFrame = app.activeWindow.activePage.rectangles.add();
        var tempXFrame = xFrame;
        var tempYFrame = yFrame;
        var tempWFrame = wFrame + xFrame;
        var tempHFrame = hFrame + yFrame;
        tempFrame.geometricBounds = [tempYFrame, tempXFrame, tempHFrame, tempWFrame];

        if (typeof(stringOrFile) == 'string') {
            tempFrame.contentType = 1952412773;
            tempFrame.getElements()[0].contents = stringOrFile;
            console.log('Frame added');
            return tempFrame.getElements()[0];
        }

        if (typeof(stringOrFile) == 'object') {
            var tempPic = new File(stringOrFile);
            tempFrame.place(tempPic, false);
            console.log('Frame added');
            return tempFrame;
        }
    }catch(e){
        console.log(e);
    }
}


function appendToFrame(frameObject, stringOrFileOrTwoDArray) {
    try{
        if (typeof(stringOrFileOrTwoDArray) == 'object') {
            // array -> create and append table
            if (stringOrFileOrTwoDArray instanceof Array) {
                //Höchste Anzahl benötigter Spalten herausfinden
                var colMaxCount = [];
                for (var i = 0; i < stringOrFileOrTwoDArray.length; i++) {
                    colMaxCount[i] = stringOrFileOrTwoDArray[i].length;
                }
                //Hilfsfunktion zum Zahlen sortieren
                function numsort(a, b) {
                    return b - a;
                }
                //Höchster Spaltenwert
                colMaxCount = colMaxCount.sort(numsort)[0];
                //Erste Zeile mit 1 Zelle exemplarisch anlegen
                var tempAppendedTable = frameObject.tables.add();
                tempAppendedTable.columnCount = colMaxCount; //Limit: 200
                tempAppendedTable.bodyRowCount = 1;
                //Inhaltszeilen anlegen
                for (var k = 0; k < stringOrFileOrTwoDArray.length; k++) {
                    tempAppendedTable.rows[k].contents = stringOrFileOrTwoDArray[k];
                    tempAppendedTable.rows.add();
                }
                //Letzte leere Zeile entfernen
                tempAppendedTable.rows.lastItem().remove();
                console.log('Table appended');
                return tempAppendedTable;
            } else {
                // not an array -> file -> append/place inline file object
                var tempPic = new File(stringOrFileOrTwoDArray);
                // var tempAppendedPic = frameObject.parentStory.insertionPoints[-1].place (tempPic, false, {visibleBounds:['0 mm','0 mm','10 mm','10 mm']});
                var tempAppendedPic = frameObject.parentStory.insertionPoints[-1].place(tempPic, false);
                // return parent container [object Rectangle] of image
                console.log('Image appended');
                return tempAppendedPic[0].parent;
            }
        } else if (typeof(stringOrFileOrTwoDArray) == 'string') {
            // string -> append string
            frameObject.parentStory.insertionPoints[-1].contents = stringOrFileOrTwoDArray;
            var tempAppendedText = frameObject.parentStory.characters.itemByRange(-1, -stringOrFileOrTwoDArray.length);
            console.log('String appended');
            return tempAppendedText;
        }
    }catch(e){
        console.log(e);
    }
}


// tagThisObject() replaces deprecated tagThis() function

function tagThisObject(tagObject, syncScript, syncIdentifier) {
    var tagName = 'porky';
    var associatedElement;
    var tempTarget;
    var tempObject;


    if((tagObject instanceof Array).toString() === 'false'){
        tempObject = tagObject;
        tagObject = [];
        tagObject.push(tempObject);

    }else if((tagObject instanceof Array).toString() === 'true'){
        if(tagObject.length > 1){
            tagObject.splice(1, tagObject.length - 1);
            console.log('Warning: Too many objects, skipping all but last item of array!');
        }
    }

    if(tagObject.toString() === '' || tagObject.toString() === 'undefined' || syncScript === '' || syncIdentifier === ''){
        console.log('Error: tagThisObject() expects object and parameters... cannot proceed.');
        return false;
    }


    if (tagObject.toString() === '[object TextFrame]') {
        
        tempTarget = tagObject[0].parentStory;
        if(tempTarget.associatedXMLElement){
            // untags separately tagged text parts inside of a textframe when the textframe is tagegd afterwards
            tempTarget.associatedXMLElement.untag();
        }
        associatedElement = app.activeDocument.xmlElements.item(0).xmlElements.add(tagName, tempTarget);

    } else if (tagObject.toString() === '[object Rectangle]' || tagObject.toString() === '[object Oval]' || tagObject.toString() === '[object Polygon]' || tagObject.toString() === '[object Table]') {
        
        tempTarget = tagObject[0];
        if(tempTarget.associatedXMLElement){
            tempTarget.associatedXMLElement.untag();
        }
        associatedElement = app.activeDocument.xmlElements.item(0).xmlElements.add(tagName, tempTarget);

    } else if (tagObject.toString() === '[object Word]' || tagObject.toString() === '[object Paragraph]' || tagObject.toString() === '[object InsertionPoint]' || tagObject.toString() === '[object Character]' || tagObject.toString() === '[object Text]' || tagObject.toString() === '[object TextColumn]') {

        tempTarget = tagObject[0];    
        if(tempTarget.associatedXMLElements[0]){
            // untags textframe if a word inside of it is tagged afterwards
            if(tempTarget.associatedXMLElements[0].markupTag.name.toString() === tagName){
                tempTarget.associatedXMLElements[0].untag();
            }
        }
        associatedElement = app.activeDocument.xmlElements.item(0).xmlElements.add(tagName, tempTarget);

    } else {
        associatedElement = false;
        console.log(tagObject + ' is not supported');

    }

    if(associatedElement){
        associatedElement.xmlAttributes.add('syncScript', syncScript);
        associatedElement.xmlAttributes.add('syncIdentifier', syncIdentifier);
    }

    return associatedElement;
}



function tagThis(tagObject, syncScript, syncIdentifier) {

    // return tagThisObject(tagObject, syncScript, syncIdentifier);

    
    //SOLL: InsertionPoint, Word, Text, Paragraph, Character, TextColumn, Story, Table, TextFrame, Rectangle, Image
    //IST:     InsertionPoint, Word, Text, Paragraph, Character, TextColumn,          , Table, TextFrame, Rectangle
    var porkyTagElement = '';
    var tempTagName = 'porky';
    var assXMLElem = '';
    //Textframe
    if (tagObject == '[object TextFrame]') {
        assXMLElem = tagObject.parentStory.associatedXMLElement;
        if (assXMLElem === null) {
            //app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject.parentStory);
            assXMLElem = app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject.parentStory);
        }
        if (!assXMLElem.xmlAttributes.item('syncScript').isValid) {
            assXMLElem.xmlAttributes.add('syncScript', syncScript);
        } else {
            assXMLElem.xmlAttributes.item('syncScript').value = syncScript;
        }
        if (!assXMLElem.xmlAttributes.item('syncIdentifier').isValid) {
            assXMLElem.xmlAttributes.add('syncIdentifier', syncIdentifier);
        } else {
            assXMLElem.xmlAttributes.item('syncIdentifier').value = syncIdentifier;
        }
        console.log(tagObject + ' tagged');
        return assXMLElem; //XML Element zurückgeben
    }
    // Rectangle
    if (tagObject == '[object Rectangle]' || tagObject == '[object Oval]' || tagObject == '[object Polygon]') {
        assXMLElem = tagObject.associatedXMLElement;
        if (assXMLElem === null) {
            assXMLElem = app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject);
        }
        if (!assXMLElem.xmlAttributes.item('syncScript').isValid) {
            assXMLElem.xmlAttributes.add('syncScript', syncScript);
        } else {
            assXMLElem.xmlAttributes.item('syncScript').value = syncScript;
        }
        if (!assXMLElem.xmlAttributes.item('syncIdentifier').isValid) {
            assXMLElem.xmlAttributes.add('syncIdentifier', syncIdentifier);
        } else {
            assXMLElem.xmlAttributes.item('syncIdentifier').value = syncIdentifier;
        }
        console.log(tagObject + ' tagged');
        return assXMLElem; //XML Element zurückgeben
    }
    if (tagObject == '[object Word]' || tagObject == '[object Paragraph]' || tagObject == '[object InsertionPoint]' || tagObject == '[object Character]' || tagObject == '[object Text]' || tagObject == '[object TextColumn]') {
        //Bei direkter Verwendung des Objekts über eine Variable
        if (tagObject.parent instanceof Array) {
            //[object Story] von tagObject taggen, falls nicht schon geschehen
            try {
                app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject.parent[0]);
            } catch (e) {
                // $.writeln('tagObject.parent -> cannot add xmlElements.add(): ' + e);
                console.log(e);
            }
        }
        //Bei selection[0]
        if (!tagObject.parent instanceof Array) {
            //[object Story] von tagObject taggen, falls nicht schon geschehen
            try {
                app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject.parent);
            } catch (e) {
                // $.writeln('!tagObject.parent -> cannot add xmlElements.add(): ' + e);
                console.log(e);
            }
        }
        if (tagObject.parent == '[object Story]') {
            try {
                //alert(tagObject.contents + '\n' + tagObject.associatedXMLElements[0].xmlContent.contents);
                if (tagObject == tagObject.associatedXMLElements[0].xmlContent) {
                    tempTagName = tagObject.associatedXMLElements[0].markupTag.name;
                    tagObject.associatedXMLElements[0].untag();
                }
            } catch (e) {
                // $.writeln('tagObject.parent = [object Story]-> cannot associatedXMLElements[0].untag(): ' + e);
                console.log(e);
            }
            tagObject = app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject);
            tagObject.xmlAttributes.add('syncScript', syncScript);
            tagObject.xmlAttributes.add('syncIdentifier', syncIdentifier);
            console.log(tagObject + ' tagged');
            return tagObject; //XML Element zurückgeben
        }
        // Text selection inside of table cell
        if (tagObject.parent == '[object Cell]') {
            // alert('porky\n' + tagObject.parent + '\n' +  tagObject);
            try {
                // alert(tagObject.parent + '\n' + tagObject.contents + '\n' + tagObject.associatedXMLElements[0].xmlContent);
                if (tagObject == tagObject.associatedXMLElements[0].xmlContent) {
                    tempTagName = tagObject.associatedXMLElements[0].markupTag.name;
                    tagObject.associatedXMLElements[0].untag();
                }
            } catch (e) {
                console.log(e);
            }
            tagObject = app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject);
            tagObject.xmlAttributes.add('syncScript', syncScript);
            tagObject.xmlAttributes.add('syncIdentifier', syncIdentifier);
            console.log(tagObject + ' tagged');
            return tagObject; //XML Element zurückgeben
        } else {
            console.log(tagObject + ' tagged');
            return tagObject;
        }
    }
    // Table
    if (tagObject == '[object Table]') {
        try {
            //alert(tagObject.contents + '\n' + tagObject.associatedXMLElement.xmlContent.contents);
            if (tagObject == tagObject.associatedXMLElement.xmlContent) {
                tempTagName = tagObject.associatedXMLElement.markupTag.name;
                tagObject.associatedXMLElement.untag();
            }
        } catch (e) {
            // $.writeln('tagObject = [object Table]-> cannot associatedXMLElement.untag(): ' + e);
            console.log(e);
        }
        tagObject = app.activeDocument.xmlElements.item(0).xmlElements.add(tempTagName, tagObject);
        tagObject.xmlAttributes.add('syncScript', syncScript);
        tagObject.xmlAttributes.add('syncIdentifier', syncIdentifier);
        console.log(tagObject + ' tagged');
        return tagObject; //XML Element zurückgeben
    }
    // Table cell ***
    if (tagObject == '[object Cell]') {
        console.log(tagObject + ' is not supported');
    } else {
        console.log(tagObject + ' tagged');
        return tagObject;
    }
    
}


function recursiveSyncFrame(frameObject) {
    var tempRes = '';
    if (frameObject instanceof Array) {
        //aus Array
        for (var c = 0; c < frameObject.length; c++) {
            //Rahmen
            if (frameObject[c] == '[object XMLElement]') {
                tempRes = recursiveSyncXMLElement(frameObject[c]);
            }
            if (frameObject[c] == '[object TextFrame]' || frameObject[c] == '[object Rectangle]' || frameObject[c] == '[object Image]' || frameObject[c] == '[object Story]') {
                tempRes = recursiveSyncXMLElement(frameObject[c].associatedXMLElement);
            }
        }
        //direkt
    } else {
        if (frameObject == '[object XMLElement]') {
            tempRes = recursiveSyncXMLElement(frameObject);
        }
        if (frameObject == '[object TextFrame]' || frameObject == '[object Rectangle]' || frameObject == '[object Image]' || frameObject == '[object Story]') {
            tempRes = recursiveSyncXMLElement(frameObject.associatedXMLElement);
        }
    }
    return tempRes;
}


function setSyncIdentifier(singleTaggedObject, syncIdentifier) {
    try {
        if (singleTaggedObject == '[object Table]' || singleTaggedObject == '[object TextFrame]' || singleTaggedObject == '[object Rectangle]' || singleTaggedObject == '[object Image]' || singleTaggedObject == '[object Story]') {
            if (singleTaggedObject.associatedXMLElement.isValid) {
                singleTaggedObject.associatedXMLElement.xmlAttributes.item('syncIdentifier').value = syncIdentifier;
            }
        } else if (singleTaggedObject == '[object Word]' || singleTaggedObject == '[object Paragraph]' || singleTaggedObject == '[object InsertionPoint]' || singleTaggedObject == '[object Character]' || singleTaggedObject == '[object Text]' || singleTaggedObject == '[object TextColumn]' || singleTaggedObject == '[object Line]') {
            if (singleTaggedObject.associatedXMLElements[0].isValid) {
                singleTaggedObject.associatedXMLElements[0].xmlAttributes.item('syncIdentifier').value = syncIdentifier;
            }
        }
        return singleTaggedObject;
    } catch (e) {
        // $.writeln('setSyncIdentifier(singleTaggedObject, syncIdentifier): ' + e);
        console.log('Error: Cannot set ' + syncIdentifier + ' ' + e);
        return false;
    }
}


function recursiveSetSyncIdentifier(taggedObject, syncIdentifier) {
    try {
        for (var t = 0; t < taggedObject.length; t++) {
            if (taggedObject[t] == '[object Table]' || taggedObject[t] == '[object TextFrame]' || taggedObject[t] == '[object Rectangle]' || taggedObject[t] == '[object Image]' || taggedObject[t] == '[object Story]') {
                if (taggedObject[t].associatedXMLElement) {
                    var tempAssElem = taggedObject[t].associatedXMLElement;
                    //taggedObject[t].associatedXMLElement.xmlAttributes.item('syncIdentifier').value = syncIdentifier;
                    if (tempAssElem.markupTag.name == 'porky' && tempAssElem.xmlAttributes.item('syncIdentifier').isValid) {
                        tempAssElem.xmlAttributes.item('syncIdentifier').value = syncIdentifier;
                    }
                    //sub elements
                    for (var i = 0; i < tempAssElem.xmlElements.length; i++) {
                        if (tempAssElem.xmlElements[i].markupTag.name == 'porky' && tempAssElem.xmlElements[i].xmlAttributes.item('syncIdentifier').isValid) {
                            tempAssElem.xmlElements[i].xmlAttributes.item('syncIdentifier').value = syncIdentifier;
                        }
                    }
                }
            } else if (taggedObject[t] == '[object Word]' || taggedObject[t] == '[object Paragraph]' || taggedObject[t] == '[object InsertionPoint]' || taggedObject[t] == '[object Character]' || taggedObject[t] == '[object Text]' || taggedObject[t] == '[object TextColumn]' || taggedObject[t] == '[object Line]') {
                if (taggedObject[t].associatedXMLElements[0]) {
                    var tempAssElemsFirst = taggedObject[t].associatedXMLElements[0];
                    //taggedObject[t].associatedXMLElements[0].xmlAttributes.item('syncIdentifier').value = syncIdentifier;
                    if (tempAssElemsFirst.markupTag.name == 'porky') {
                        tempAssElemsFirst.xmlAttributes.item('syncIdentifier').value = syncIdentifier;
                    }
                    //sub elements
                    for (var k = 0; k < tempAssElemsFirst.xmlElements.length; k++) {
                        if (tempAssElemsFirst.xmlElements[k].markupTag.name == 'porky') {
                            tempAssElemsFirst.xmlElements[k].xmlAttributes.item('syncIdentifier').value = syncIdentifier;
                        }
                    }
                }
            }
        }
        return taggedObject;
    } catch (e) {
        // $.writeln('recursiveSetSyncIdentifier(taggedObject, syncIdentifier): ' + e);
        console.log('Error: Cannot set ' + syncIdentifier + ' ' + e);
        return false;
    }
    /*
    if(taggedObject.associatedXMLElement.markupTag.name == 'porky'){
        taggedObject.associatedXMLElement.xmlAttributes.item('syncIdentifier').value = syncIdentifier;;
    }

    //sub elements
    for(var i = 0; i < taggedObject.associatedXMLElement.xmlElements.length; i++){
        if(taggedObject.associatedXMLElement.xmlElements[i].markupTag.name == 'porky'){
            taggedObject.associatedXMLElement.xmlElements[i].xmlAttributes.item('syncIdentifier').value = syncIdentifier;
        }
    }
    return taggedObject;
*/
}


function syncXMLElement(taggedXMLElement) {
    if(!settings.sync.scriptFolder || settings.sync.scriptFolder === ''){
        console.log('Error: global object settings.sync.scriptFolder ist invalid or empty but must be set before syncing');
        return false;
    }
    // if not [object XMLElement] then use the object's associatedXMLElement
    if (taggedXMLElement != '[object XMLElement]') {
        if (taggedXMLElement == '[object Table]' || taggedXMLElement == '[object TextFrame]' || taggedXMLElement == '[object Rectangle]' || taggedXMLElement == '[object Image]' || taggedXMLElement == '[object Story]') {
            if (taggedXMLElement.associatedXMLElement.isValid) {
                syncXMLElement(taggedXMLElement.associatedXMLElement);
            }
        } else if (taggedXMLElement == '[object Word]' || taggedXMLElement == '[object Paragraph]' || taggedXMLElement == '[object InsertionPoint]' || taggedXMLElement == '[object Character]' || taggedXMLElement == '[object Text]' || taggedXMLElement == '[object TextColumn]' || taggedXMLElement == '[object Line]') {
            if (taggedXMLElement.associatedXMLElements[0].isValid) {
                syncXMLElement(taggedXMLElement.associatedXMLElements[0]);
            }
        } else {
            return taggedXMLElement;
        }
        // if [object XMLElement] then use the object's xmlContent directly
    } else {
        if (taggedXMLElement !== null) {
            // only proceed if there's more than 2 attributes
            if (taggedXMLElement.xmlAttributes.length > 1) {
                // only proceed if at minimum the attributes syncScript and syncIdentifier are available
                if (taggedXMLElement.xmlAttributes.item('syncScript').isValid && taggedXMLElement.xmlAttributes.item('syncIdentifier').isValid) {
                    // set global object settings.sync.identifier for use in external sync scripts
                    settings.sync.identifier = taggedXMLElement.xmlAttributes.item('syncIdentifier').value;
                    // handle images
                    if (taggedXMLElement.xmlContent == '[object Image]' || taggedXMLElement.xmlContent == '[object EPS]' || taggedXMLElement.xmlContent == '[object PDF]' || taggedXMLElement.xmlContent == '[object PICT]' || taggedXMLElement.xmlContent == '[object WMF]') {
                        try {
                            // content syncable
                            taggedXMLElement.xmlContent.place(new File($.evalFile(File(settings.sync.scriptFolder + taggedXMLElement.xmlAttributes.item('syncScript').value))), false);
                            return taggedXMLElement;
                        } catch (e) {
                            // content not syncable or already done by external syncScript
                            console.log('Error: \'' + taggedXMLElement.xmlAttributes.item('syncIdentifier').value + '\' global object settings.sync.scriptFolder + xmlAttributes.item(\'syncScript\').value ' + e);
                            return false;
                        }
                    }
                    // handle text
                    else if (taggedXMLElement.xmlContent == '[object Story]' || taggedXMLElement.xmlContent == '[object Text]' ||  taggedXMLElement.xmlContent == '[object Table]') {
                        // [object Story] or [object Text]
                        // var tempLocation = taggedXMLElement.xmlContent.parentStory;
                        var tempLocation = taggedXMLElement.xmlContent;
                        // if not a table
                        if (tempLocation.tables.length < 1) {
                            try {
                                // content syncable
                                taggedXMLElement.contents = $.evalFile(File(settings.sync.scriptFolder + taggedXMLElement.xmlAttributes.item('syncScript').value));
                                return taggedXMLElement;
                            } catch (e) {
                                // content not syncable or already done by external syncScript
                                console.log('Warning: Content not syncable or already synced. ' + e + ' syncIdentifier: \"' + taggedXMLElement.xmlAttributes.item('syncIdentifier').value + '\" syncScript: \"' + unescape(settings.sync.scriptFolder + taggedXMLElement.xmlAttributes.item('syncScript').value) + '\"');
                                return false;
                            }
                        }
                        // if table
                        else if (tempLocation.tables.length > 0) {
                            try {
                                // content syncable
                                // [object Table]
                                var newTableArray = '';
                                var tempRowsCount = '';
                                var tempColsCount = '';
                                // get content for new table
                                // content type is a 2-dimensional array
                                newTableArray = $.evalFile(File(settings.sync.scriptFolder + taggedXMLElement.xmlAttributes.item('syncScript').value));
                                // first delete all existing rows but keep first
                                if (tempLocation.tables[0].rows.length > 1) {
                                    tempRowsCount = tempLocation.tables[0].rows.length;
                                    for (var i = 0; i < tempRowsCount - 1; i++) {
                                        tempLocation.tables[0].rows.lastItem().remove();
                                    }
                                }
                                // then delete all columns but keep first
                                if (tempLocation.tables[0].columns.length > 1) {
                                    tempColsCount = tempLocation.tables[0].columns.length;
                                    for (var k = 0; k < tempColsCount - 1; k++) {
                                        tempLocation.tables[0].columns.lastItem().remove();
                                    }
                                }
                                // calculate max columns
                                var colMaxCount = [];
                                for (var l = 0; l <= newTableArray.length - 1; l++) {
                                    colMaxCount[l] = newTableArray[l].length;
                                }
                                // little helper function for sorting numbers
                                function numsort(a, b) {
                                    return b - a;
                                }
                                // max columns count
                                colMaxCount = colMaxCount.sort(numsort)[0];
                                // create first row
                                for (var n = 1; n < colMaxCount; n++) {
                                    tempLocation.tables[0].columns.add();
                                }
                                // add content rows
                                for (var p = 0; p < newTableArray.length; p++) {
                                    tempLocation.tables[0].rows[p].contents = newTableArray[p];
                                    tempLocation.tables[0].rows.add();
                                }
                                // remove last empty row
                                tempLocation.tables[0].rows.lastItem().remove();
                                return taggedXMLElement;
                            } catch (e) {
                                // content not syncable or already done by external syncScript
                                console.log(e);
                                return false;
                            }
                        } else {
                            console.log('Error: tables.length !> 0');
                            return false;
                        }
                    }
                } else {
                    console.log('Error: invalid xmlAttributes.item(\'syncScript\') or invalid xmlAttributes.item(\'syncIdentifier\')!');
                    return false;
                }
            }
        }
    }
}


function recursiveSyncXMLElement(taggedXMLElement) {
    if (taggedXMLElement == '[object XMLElement]') {
        syncXMLElement(taggedXMLElement);
        //Sub Elements
        for (var i = 0; i < taggedXMLElement.xmlElements.length; i++) {
            recursiveSyncXMLElement(taggedXMLElement.xmlElements[i]);
        }
        return taggedXMLElement;
    } else {
        return false;
    }
}


function createPlaceholderImage(folder) {
    //create placeholder image from binary string
    var placeholderImageBinaryString = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00d\x00\x00\x00T\b\x03\x00\x00\x00CFb\u00CB\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x000PLTEd\u00BC\u00E0\x01Ec\x01b\u0088\u00D5\u00E8\u00EFQ\u009A\u00B6\u00FF\u00FF\u00FF\u00BB\u00DB\u00E8\u0081\u00B1\u00C4\x01\x7F\u00AD\u00EE\u00F5\u00F8\u0098\u00D0\u00E6*t\u0092\u00B6\u00CE\u00D7\u009A\u00C1\u00D0C}\u0096\u00FF\u00FF\u00FFs\u00C7-/\x00\x00\x00\x10tRNS\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\u00FF\x00\u00E0#]\x19\x00\x00\x05\u00A6IDATx\u00DA\u00ACZ\u00D9\u0082\u00AC*\f\u008C\u0086\u00C0\x04\u00C5\u00F3\u00FF\x7F{Y\x04\u00C2bK\u00CF\u009D<\u00F6\u0088E\u00AA\u00B2\u0081\x03\u00FF\x16\u008D\u00E8\u00DF\u00AF\r\u00961\x06\x10\u00FA{\x10\x1CP\u00D6}[\x061\u008E^}\u00FB\u00DF \u00D7\u00CE\u00EDK\u0089\u0097Q`U\u0092}7\x1D\u0088\u00C5\u00BF\x06\u00D1\u00FB\u00BE7/%\x06\u00FB\u00D7 \u00C6\u0083\\\u0092\x1F\u00B2\x00\u00AB|\u00AD\u0082\x1C\x1Ed?I\u00F0\x07\x00\u00FA\u00D7 4K\t\x0E\x18\u00FBQ\u00FFB\u00DA\u0083\u00AC\u00BA\x02\u00D3\u00BC\u00EB\x17\u00D3\x19A\u00AA\u00F6\u00D1\x11\x00\u00FC\x1F \u0097\u00C1\x16'J\x12,\u00871a\x04\u00B1\u00BF\x06\u00F1o\u00D8\u00B6\u00C3\u00B1\u00C0I\u0092xSTe\x0F\u00C6\u00F4k\u00E1\u00C9l\u00DE\u00AE3\u00F3vK\u00B2\u00970\u00F6\u00F1\x0B_\u00B8\x023\u00C1=a[4\u00A5\u00E3\u008F\u00E4\nH\n\u00E3$\u00FB\u00B2\u00F4\u00D0\t\u009E\u00B7\u00BE\u00DDvDyT\x01\u0089a|\u00CB\u00BE,}\x03b\u00AD\u00C6\x04D\u00E7V\u00CC\u00CB#@B\x18\u00DF\u00B2/\u00BB\x02m\u00A5\b4\u00EB 9\u00A9\u008A\u00B2\u0099JW\f\u00E3,\u00FB\u00AA+\u00D0V\u00A8\u00AC\u00A7f>\x04\n\t\x10\x1F\u00C6\\1\u0096\u00A4oA\u00C4j-\b\u00DBN#@\u0094td)\u008A\u00A1\u00CB\x10\u00B1X\x10v\u00E1.U\u0091\x18+\x05\u00AC\x03\x11\u009B\u00B4$\bC!\u00BD\u00C2\x06dAz\u00E8+\u00A1\u00D8\u00A2\u00AE J\u008B \u00B6-\b~\x0B\"\u00D2\u00CC\x13f\u0084\u00F4G\x01i\u00D9Z\u0091~\x00\u0091\u0091#\bs%\u008A\x15w \u00EF\u00D2\u00C3X\x1D\u00A7\u0084\x1D\u00A5|9\r\u00DF\u00BA2\u0082\u00C8\x00\x15\u0084\x15\u00E9\u00D1\u00C2\u00B7\u00AEL:\u00A3\u00A0\u00C3\u00D6\u0094\u00CCQ|\u00D0\u0080\u00F1\x1A\u00C5@\x7Fc/\u009E\x10\u00A1\u00FA\u0091\x06\"t7\u00ED\u00F2\u00CF\x0E\u00EF\x1C\u00FD\u00E9M\u00F1d\u0088\u00ED\u00E9\u00F224\u008B\u00F8\x12%\u00B8\u00BE4\u00F1D\x13\f\u0085\u00A1\u00F1\u00BChB\u00C4F\u00AC2\u00B2l\x19\u009D\x7F\u00D66\u0096\u00CE\x01\x04\u00CD~\u00C2\u008F\u00FB\u0080\x029\u00A6\u00B4\u00A0\u0081wY\x1Cm\u00D9qHo\u00E81\u00B4\u009Fd\u008C'\u00F5C\u008CAm\u008Bu\u00F9\u00E9\x04\u00C8^\bc;a\u00CB\u0084\u00A8S\u00C1?\u00F5(\u008C\u00EC\u00F1\u0082~\x01\u00B2)\u00CE\x11\u0081`q\x10\u00E4\nq\u009D\x1Ey\x12\x06\u00DA<\u00BC\u0097Z#QNW\u00A4\u00D7v\x10=5\u00B2{\u00DD\x1C\u00A5\u00E9\u00F1\x17b^\u00BB\u00CD\b\u00F3\r\u00B3\x0B`}\u0097\u00B4\u009C\x05sa\u00A0\u009DE\x1D'e\u00B4\u009A\x11\u00A6\u0088;\u008C\u00DC\x01Lvv\x1A\u00CB\x12D\u00C5\x1A\x1B\tQ\u00B8m\u0093\b\u00C3\u0096-S\u00AA\u00A6\u00AA\u0091=A\u0081\u00E60\x15LG\u00D7Y\u00CD\bC\x1CEO3\u009F\u00F8\u0083\x19P`\u0098\u00DC\u00FD\u00CC\x03]B\x16\u00C2Hj\u00A2\u00E4\u00CCGm\u0099y\x04)K\x0E>\u00DB\u00DA\u0092#\fNg\u009BL\u00AF\u00D6\u00D4\u00BF>c\u00A0g+\u00B5qV\u009D+\u0091\u00B0\u00D3\x1CUy\u00AB\u00E50\u00E6\u00DAJ\u00D0\n\x03\x03[w\u008F\u00B5\u00B47(\u0097\x7F=\x1F\u00BB6%3\x0F\u00B9\u00C0t\t\u00D4\b\x03\u00C39\u00E7\u00A6\f\u00C9m-aZa\u0098\u00872\u00EF\rF\u00A3\u00FC L\u00AD]\u00ED\u00A2\u00A0\x7F\u00AB\u00CA\u00C6\u00E8*\u00F9R\u00F4A\u00F9^\u0098\x02\u0082{og\u00E7\u00CBE!bS\u00E9G\u00D7?\u008Dc3+E\x06\u00E6l\u00A5\u00F3\u008EF9u\x1FI6\x1ADO[\x1Az@\x15\x06\u009E\u00D8\u008A\u00EB\u008C<A(\u008C\u00D5\u00D09\u0091\u00E9\u0082]7\u0082da\u00E0\u0091\u00AD\x10b\u009E\u00D8S(o9\u00FE\u00DA\u008B\u009E\u00FC\u00D6?3\u008B\u00C2\u00DC l& \u0091g]\u00B2\u00D2\u00F7x\f\u0084\u00E9A\u00F44*MA\u00A20\u00D0\u009D\u00A1[W0VAsW\u00960F\u00F8\u00F7\u00E3\u00CC\u00EB\u00D2Rf\u00C2\u00C0-\t\u00AA\u00E9B\x15c\x11C^:\u009B\u00A6=\u00A7\u00F9xr{f\u0090A\x02\n^\x135S\x1E\u00BB@Y\x1A,\u00D1\x17b\u00EBf \x06\u00A6\x18\u00BA\u00D2\u00E5EQ\u00AC\u008F'\u00A2\x15\u0099\u008B\u00EF\u00E1\u00DAG\x11M\u00B9\u00D5\u00F3\u00F0\"\u0091'\u00BE\u00E1\x1Av=L\u00A9\u00BAx\x1F\\\u00C8pW\x7FKx\u00F1\u008C*nk\u0097O\u00EF\u00DD\u00F59Yc\u00869\u00A0\u00B0\u00DB\x1D\u00FA\u00E28s\u0085\u00A6Tu\u00A5>\u0084\u00AA\u00AF%-L\u0099\u0085\u00C3\u0094\x011\u00B0\u00FC|7\u00D3o\u00D7\u00EA\u00A9xAs7\x14\u00AFm\u00E4\u00FDC!\x01\u00CEP\u00CC8\u0095\u009B\x1F7\u0093\u00BEk)bpi\x06\u0089\u00DC9\u00E4F1\u008F/!\u00D7S\u00CE:\u00FD3\u00CB+sN\u00ABc\x07R\u0086-#\x02\u00EDn \u00FE\u00AD\x07\u0083\u00C2\u00F8\x076v\"\u00BDl)m\x03n&\u00C8Z\u00DA\r\u0095@\u008BI\x16\u00A4\u008E\u00F3\u0090\rd\u00FAp\u00C6\u008F\u00CAw3^;\u00A6\u00D66\u00E5\u00C7\u00BC{\u00B3\u00B1\u00818\x13\u00A2*E\u00BE9<a\u00AC>\u00E4|?\u00ADv\x178\u00B2}\u009C7L\u00A8-|\u0094\u00B1\u00DB\x0F_\u0087\u00AF_z\x7Fl)\u00C3t\u00DF]{4#\u00DD\u0095\u00F6\u00EBk\u008B\u00C2\u008B\u0094 \u00C3\\\u00B3\x06\u0094\u008A\u0090\u00FA4A\u00B6\u00DA\u00E7@;\u00AF\u0090\u00906\u00CF\u00C8\u00B9XXGn\u00DER\u00EC\u00E7Y\u00B8\u00D3\u00BE\x06\u009A\u00B3\u00D8\u009D*\x7F4\x12O[\u00CA\u00F4 \u00D4\u0083\u00C8\u00AB\u00A1\x1Ch\u00DA\u009Fn'\x05|\u0094\u009E\u00CD\u00EB\u00F9\u00E4\u009E\u00F1z\u0090P\u00D1\buo\u00DE\u0095\u00E17^8iM\u00B4\u00BFg\u00A1\u00B9\u00B9\u00AB\u00B3\u00F73\u00E3\u0083\u00F6\u00E1(?_K\u00DCQ{\u00D2\u00FA\u00DD\u008A\u00E9@\u0090\x1F\u00BF\u00DC\u00F4\x0E\x7F\u00F1i\u00E3X\u00DB_\x1F\u008B'\u00AD\u00DF\x12u\u00DA\x7F\u00BAi\u0090u\u00C8;\u00F2\u00DD\u00A7\r\u00B5\u00C2\u00C1\u00FD\u00A5\u00A0\u00B2\u00FA\x15\u0088\u00D4\u00FEz\u00B9d\u00AA^\u009B\u00B7\x0B\u009CG\u00ED\u008F\u00B7;9\u00CA\u008F\u00EE\u00FC5H\u00D6\u00FE\u00FD66\u00CB\u00E2\u00DE\u00EE\u00BB\x1EY8\x17\u00EE\u00E1\u00D3hp\u00D0/@\u00A2\u00F6n\u00E9\x0BL\u00DC\u00D0\u00E7\u00ED\u00C0S\u00D8\u00BC\u008B.6\u00F4\u00F2(<~\"\u00BDV\u00BF\u0087\u00FA\u00F2\u0082o\x17\u009DO\u00FB\u00E3\u00E5/\u00E1\u00F4\u00FD\u00BD\u00F0/\u00FE]\u00E1\u00ED\u00D9\u00FF\x04\x18\x00\u00D52.\u00F5\u008E\u00B62)\x00\x00\x00\x00IEND\u00AEB`\u0082"));
    var placeholderImageFolder = '';
    if (folder === '' || folder === undefined) {
        placeholderImageFolder = new Folder(File($.fileName).parent);
        console.log('Placeholder image created in ' + File($.fileName).parent);
    } else {
        placeholderImageFolder = new Folder(folder);
    }
    placeholderImageFolder.create();
    var placeholderImage = new File(placeholderImageFolder.absoluteURI + '/placeholder-image-' + Date.now() + '.png');
    placeholderImage.encoding = 'BINARY';
    placeholderImage.open('w');
    placeholderImage.write(placeholderImageBinaryString);
    placeholderImage.close();
    return placeholderImage;
}


function stringToTwoDArray(separatedString, columnSeparator, rowSeparator) {
    if (separatedString === '' || columnSeparator === '' || rowSeparator === '') {
        return false;
    } else {
        var hasColumnSeparator = separatedString.indexOf(columnSeparator);
        var lastChar = separatedString.substring(separatedString.length - rowSeparator.length, separatedString.length);
        if (lastChar != rowSeparator) {
            separatedString = separatedString + rowSeparator;
        }
        var array1D = [];
        array1D = separatedString.split(rowSeparator);
        var array2D = [];
        for (var zaehler1D = 0; zaehler1D < array1D.length - 1; zaehler1D++) {
            array2D[zaehler1D] = [];
            array2D[zaehler1D] = array1D[zaehler1D].split(columnSeparator);
        }
        array1D = null;
        return array2D;
    }
}


function twoDArrayToString(twoDArray, columnSeparator, rowSeparator) {
    var tempResult = '';
    for (var r = 0; r <= twoDArray.length - 1; r++) {
        tempResult += twoDArray[r].join(columnSeparator) + rowSeparator;
    }
    tempResult = tempResult.substring(0, (tempResult.length - rowSeparator.length));
    return tempResult;
}


function addNewPage() {
    var tempPage = app.activeDocument.pages.add(LocationOptions.AT_END);
    app.activeWindow.activePage = tempPage;
    return tempPage;
}


function moveObjectToPage(frameObject, pageObject) {
    var tempBounds = frameObject.geometricBounds;
    app.activeDocument.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN; //ARGHH!
    frameObject.move(pageObject);
    frameObject.geometricBounds = tempBounds;
    return frameObject;
}


function setPageSize(xWidth, yHeight) {
    app.activeDocument.documentPreferences.pageWidth = xWidth;
    app.activeDocument.documentPreferences.pageHeight = yHeight;
    return true;
}


function placeSnippet(snippetPath, xSnippet, ySnippet) {
    var tempSnippetPath = new File(snippetPath);
    var tempSnippet = app.activeWindow.activePage.place(tempSnippetPath, [xSnippet, ySnippet]);
    return tempSnippet;
}


function placeAssetFromLibrary(assetName, xAsset, yAsset) {
    // to do...
    /*
    myLibrary = app.libraries[0];

    for(var i=0; i<myLibrary.assets.length;i++){
        alert(myLibrary.assets[i].name);
        if(myLibrary.assets[i].name == assetName){
            alert('bingo! Placing this asset: ' + assetName);
        }
    }
    */
}


function searchReplaceTextframe(textframeObject, searchText, replaceText) {
    app.findTextPreferences = NothingEnum.nothing;
    app.changeTextPreferences = NothingEnum.nothing;
    app.findTextPreferences.findWhat = searchText;
    app.changeTextPreferences.changeTo = replaceText;
    textframeObject.parentStory.changeText();
    return textframeObject;
}


function resetCharacterStyle(textObject) {
    var tempNoneStyleName = '---basedOnNoneStyle---';
    try {
        app.activeDocument.characterStyles.item(tempNoneStyleName).remove();
    } catch (e) {
        // $.writeln('cannot app.activeDocument.characterStyles.item(tempNoneStyleName).remove(): ' + e);
        console.log(e);
    }
    var noneStyle = app.activeDocument.characterStyles.item(0);
    var basedOnNone = app.activeDocument.characterStyles.add({
        name: tempNoneStyleName,
        basedOn: noneStyle
    });
    textObject.applyCharacterStyle(basedOnNone);
    basedOnNone.remove(noneStyle);
    return textObject;
}


function fitTextboxHeightToContent(frameObject) {
    var tempBounds = frameObject.geometricBounds;
    while (!frameObject.overflows) {
        tempBounds[2] -= 1;
        frameObject.geometricBounds = tempBounds;
        if (tempBounds[2] * 1 < 1) {
            break;
        }
    }
    while (frameObject.overflows) {
        tempBounds[2] += 1;
        frameObject.geometricBounds = tempBounds;
    }
    tempBounds[2] += 3;
    frameObject.geometricBounds = tempBounds;
    return frameObject;
}


function fitTextboxHeightAndThread(frameObject, xNextFrame, yNextFrame, wNextFrame, hNextFrame) {
    // use last thread of threaded textframe
    // if not threaded textframe itself will be used
    frameObject = frameObject.endTextFrame;
    var tempBounds = frameObject.geometricBounds;
    var tempPage = frameObject.parent.pages[0];
    while (!frameObject.overflows) {
        tempBounds[2] -= 1;
        frameObject.geometricBounds = tempBounds;
        if (tempBounds[2] * 1 < 1) {
            break;
        }
    }
    while (frameObject.overflows) {
        tempBounds[2] += 1;
        frameObject.geometricBounds = tempBounds;
    }
    tempBounds[2] += 3;
    frameObject.geometricBounds = tempBounds;
    // if frameObject bottom hits page bottom margin or is already over it
    if (tempBounds[2] >= tempPage.bounds[2] - tempPage.marginPreferences.bottom) {
        // reset bottom margin to max allowed size
        tempBounds[2] = tempPage.bounds[2] - tempPage.marginPreferences.bottom;
        frameObject.geometricBounds = tempBounds;
        try {
            // proceed on new after current page
            tempPage = app.activeDocument.pages.add(LocationOptions.AFTER, tempPage);
            app.activeWindow.activePage = tempPage;
            // add a new text frame there
            var tempNextTextframe = addFrame(0, 0, 1, 1, '');
            // connect old and new text frame
            frameObject.nextTextFrame = tempNextTextframe;
            // resize nextTextFrame
            tempNextTextframe = modifyFrame(tempNextTextframe, xNextFrame, yNextFrame, wNextFrame, hNextFrame);
            // try if nextTextFrame needs to be resized; use same resizing values as before
            fitTextboxHeightAndThread(frameObject.nextTextFrame, xNextFrame, yNextFrame, wNextFrame, hNextFrame);
        } catch (e) {
            console.log(e);
            return false;
        }
    }
    return frameObject;
}


function httpGetBinaryFile(httpSourceFileURL, httpSourcePort, targetFolder) {
    if (httpSourceFileURL.indexOf('://') < 0) {
        // exit if there's no protocol given
        return false;
    }
    var urlWithoutProtocol = httpSourceFileURL.substr(httpSourceFileURL.indexOf('://') + 3);
    var targetFilename = urlWithoutProtocol.substring(urlWithoutProtocol.lastIndexOf('/') + 1);
    var httpSourceHost = urlWithoutProtocol.substr(0, urlWithoutProtocol.indexOf('/'));
    var httpSourcePath = urlWithoutProtocol.substr(urlWithoutProtocol.indexOf('/') + 1);
    // binary file download
    var httpConnection = new Socket();
    httpConnection.timeout = 6000;
    if (httpConnection.open(httpSourceHost + ':' + httpSourcePort, 'BINARY')) {
        httpConnection.write('GET http://' + httpSourceHost + '/' + httpSourcePath + ' HTTP/1.0\n\n');
        var httpBinaryReply = httpConnection.read(99999999999);
        httpConnection.close();
        httpBinaryReply = removeHeaders(httpBinaryReply);
        var tempTargetFile = File(targetFolder + '/' + targetFilename);
        tempTargetFile.encoding = 'BINARY';
        tempTargetFile.open('w');
        tempTargetFile.write(httpBinaryReply);
        tempTargetFile.close();
        return tempTargetFile;
    } else {
        console.log('Error: http connection not possible');
        return false;
    }
    // internal helper functions
    // Remove header lines from HTTP response  
    function removeHeaders(binaryWithHeader) {
        var endFlag = true;
        var tempLine = '';
        var nFirst = 0;
        var count = 0;
        while (endFlag) {
            // iterate over header lines
            tempLine = iterateHeaderLines(binaryWithHeader);
            endFlag = tempLine.length >= 2;
            nFirst = tempLine.length + 1;
            binaryWithHeader = binaryWithHeader.substr(nFirst);
        }
        return binaryWithHeader;
    }
    // get single response line from header
    function iterateHeaderLines(headerLine) {
        var tempLine = '';
        // computing line end char 10 \n
        for (var i = 0; headerLine.charCodeAt(i) != 10; i++) {
            tempLine += headerLine[i];
        }
        return tempLine;
    }
}


function modifyFrame(frameObject, xFrame, yFrame, wFrame, hFrame) {
    var tempXFrame = xFrame;
    var tempYFrame = yFrame;
    var tempWFrame = wFrame + xFrame;
    var tempHFrame = hFrame + yFrame;
    frameObject.geometricBounds = [tempYFrame, tempXFrame, tempHFrame, tempWFrame];
    return frameObject;
}


function csvToTwoDArray(csvString, splittingOptions) {
    // heavily inspired by
    // (c)2012-2013 Daniel Tillin
    // http://code.google.com/p/csv-to-array/
    var od = {
        'fSep': ',',
        'rSep': '\r\n',
        'quot': '"',
        'head': false,
        'trim': false
    };
    if (splittingOptions) {
        for (var i in od) {
            if (!splittingOptions[i]) splittingOptions[i] = od[i];
        }
    } else {
        splittingOptions = od;
    }
    var a = [
        ['']
    ];
    for (var r = f = p = q = 0; p < csvString.length; p++) {
        switch (c = csvString.charAt(p)) {
            case splittingOptions.quot:
                if (q && csvString.charAt(p + 1) == splittingOptions.quot) {
                    a[r][f] += splittingOptions.quot;
                    ++p;
                } else {
                    q ^= 1;
                }
                break;
            case splittingOptions.fSep:
                if (!q) {
                    if (splittingOptions.trim) {
                        a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                    }
                    a[r][++f] = '';
                } else {
                    a[r][f] += c;
                }
                break;
            case splittingOptions.rSep.charAt(0):
                if (!q && (!splittingOptions.rSep.charAt(1) || (splittingOptions.rSep.charAt(1) && splittingOptions.rSep.charAt(1) == csvString.charAt(p + 1)))) {
                    if (splittingOptions.trim) {
                        a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                    }
                    a[++r] = [''];
                    a[r][f = 0] = '';
                    if (splittingOptions.rSep.charAt(1)) {
                        ++p;
                    }
                } else {
                    a[r][f] += c;
                }
                break;
            default:
                a[r][f] += c;
        }
    }
    if (splittingOptions.head) {
        a.shift();
    }
    if (a[a.length - 1].length < a[0].length) {
        a.pop();
    }
    return a;
}


function readFile(fullFilePath) {
    var fileIn = File(fullFilePath);
    fileIn.open('r');
    if (fileIn.exists) {
        var fileContent = fileIn.read();
        fileIn.close();
        console.log('File read: ' + fullFilePath);
        return (fileContent.toString());
    } else {
        console.log(fullFilePath + ' Error: File does not exist.');
        return false;
    }
}


function writeFile(fullFilePath, fileContent, lineEnding) {
    var fileOut = File(fullFilePath);
    fileOut.open('w');
    if (fileOut.exists) {
        fileOut.encoding = 'UTF-8';
        if (!lineEnding || lineEnding != 'Unix' && lineEnding != 'Windows' && lineEnding != 'Macintosh') {
            lineEnding = 'Unix'; // 'Windows' or 'Macintosh'
        }
        fileOut.lineFeed = lineEnding;
        fileOut.write(fileContent);
        console.log('File written: ' + fullFilePath);
        fileOut.close();
        return true;
    } else {
        console.log(fullFilePath + ' Error: File does not exist.');
        return false;
    }
}


function placeHTML(targetObject, htmlText, inlineStyles, blockStyles) {

    /*
    targetObject is the object where the content of htmlText is placed via InDesign place() tagged text function

    htmlText is simple and clean html without attributes and styles
    htmlText will be converted to tagged text

    inlineStyles is a comma separated string holding all html tags for which a character style will be created in InDesign

    blockStyles is a comma separated string holding all html tags for which a paragraph style will be created in InDesign
    'table', 'tr', 'td', 'olli', 'ulli' and 'hr' are treated as block styles
    */
    // split html styles and create array
    inlineStyles = inlineStyles.replace(/ /g, '').split(',');
    blockStyles = blockStyles.replace(/ /g, '').split(',');
    // read document character and paragaph styles 
    var tempCharStyles = app.activeDocument.characterStyles;
    var tempCharNoneStyle = tempCharStyles.item(0);
    var tempParaStyles = app.activeDocument.paragraphStyles;
    var tempParaNoneStyle = tempParaStyles.item(0);
    // a few standard html cleanups
    htmlText = htmlText.replace(/\n/g, '');
    htmlText = htmlText.replace(/<br>/g, '[LF]');
    htmlText = htmlText.replace(/<br\/>/g, '[LF]');
    htmlText = htmlText.replace(/<br \/>/g, '[LF]');
    htmlText = htmlText.replace(/\r/g, '');
    htmlText = htmlText.replace(/\r\n/g, '');
    htmlText = htmlText.replace(/ style="(.*?)"/g, '');
    htmlText = htmlText.replace(/ id="(.*?)"/g, '');
    htmlText = htmlText.replace(/ class="(.*?)"/g, '');
    htmlText = htmlText.replace(/ name="(.*?)"/g, '');
    htmlText = htmlText.replace(/ alt="(.*?)"/g, '');
    htmlText = htmlText.replace(/<a href=".*?">/g, '<a>').replace(/<\/a>/g, '');
    // iterate html styles array
    for (var i in inlineStyles) {
        // tempCharStyles.everyItem().name.join().indexOf(inlineStyles[i])
        try {
            // create new style if it doesn't exist
            tempCharStyles.add({
                name: inlineStyles[i],
                basedOn: tempCharNoneStyle
            });
        } catch (e) {
            console.log('Cannot create ' + inlineStyles[i] + ': ' + e);
        }
        // parse htmlText and create tagged text
        // if (inlineStyles[i] == 'a') {
        //     htmlText = htmlText.replace(/<a href=".*?">/g, '<a>').replace(/<\/a>/g, '');
        // } else 
        if (inlineStyles[i] == 'img') {
            // clean up html tag
            // htmlText = htmlText.replace(/<img src="(.*?)" (.*?)>/g, '[porky-img]$1[/porky-img]');
            htmlText = htmlText.replace(/<img src="(.*?)">/g, '[img]$1[/img]');
            // clean up url
            // htmlText = htmlText.replace(/\[porky-img\]\/\//g, '[porky-img]');
            htmlText = htmlText.replace(/\[img\]\/\//g, '[img]');
        } else {
            // htmlText = htmlText.replace('<' + inlineStyles[i] + '>', '<CharStyle:' + inlineStyles[i] + '>').replace('</' + inlineStyles[i] + '>', '<CharStyle:>');
            var tempStartInlineTag = '<' + inlineStyles[i] + '>';
            var tempEndInlineTag = '</' + inlineStyles[i] + '>';
            htmlText = htmlText.replace(new RegExp(tempStartInlineTag, 'g'), '<CharStyle:' + inlineStyles[i] + '>').replace(new RegExp(tempEndInlineTag, 'g'), '<CharStyle:>');
        }
    }
    for (var b in blockStyles) {
        if (blockStyles[b] == 'ol') {
            blockStyles[b] = 'olli';
        }
        if (blockStyles[b] == 'ul') {
            blockStyles[b] = 'ulli';
        }
        // tempParaStyles.everyItem().name.join().indexOf(blockStyles[b])
        try {
            // create new style if it doesn't exist
            tempParaStyles.add({
                name: blockStyles[b],
                basedOn: tempParaNoneStyle
            });
        } catch (e) {
            console.log('Cannot create ' + blockStyles[b] + ': ' + e);
        }
        // parse htmlText and create tagged text
        if (blockStyles[b] == 'table' || blockStyles[b] == 'tr' || blockStyles[b] == 'td' || blockStyles[b] == 'olli' || blockStyles[b] == 'ulli' || blockStyles[b] == 'hr') {
            if (blockStyles[b] == 'table') {
                // remove tag <tbody>
                htmlText = htmlText.replace(/<tbody>/g, '').replace(/<\/tbody>/g, '');
                htmlText = htmlText.replace(/<table>/g, '<TableStart:>').replace(/<\/table>/g, '<TableEnd:>');
            }
            if (blockStyles[b] == 'tr') {
                htmlText = htmlText.replace(/<tr>/g, '<RowStart:>').replace(/<\/tr>/g, '<RowEnd:>');
            }
            if (blockStyles[b] == 'td') {
                // remove table headers, convert <th> to normal <td>
                htmlText = htmlText.replace(/<thead>/g, '').replace(/<\/thead>/g, '');
                htmlText = htmlText.replace(/<th>/g, '<td>').replace(/<th (.*?)>/g, '<td>').replace(/<\/th>/g, '</td>');
                htmlText = htmlText.replace(/<td (.*?)>/g, '<td>');
                htmlText = htmlText.replace(/<td>/g, '<CellStart:>').replace(/<\/td>/g, '<CellEnd:>');
            }
            if (blockStyles[b] == 'olli') {
                htmlText = htmlText.replace(/<ol><li>/g, '<ParaStyle:olli>').replace(/<\/li><\/ol>/g, '\r');
                htmlText = htmlText.replace(/<\/li><li>/g, '\n');
            }
            if (blockStyles[b] == 'ulli') {
                htmlText = htmlText.replace(/<ul><li>/g, '<ParaStyle:ulli>').replace(/<\/li><\/ul>/g, '\r');
                htmlText = htmlText.replace(/<\/li><li>/g, '\n');
            }
            if (blockStyles[b] == 'hr') {
                htmlText = htmlText.replace(/<hr>/g, '\r<ParaStyle:hr>');
            }
        } else {
            // htmlText = htmlText.replace('<' + blockStyles[b] + '>', '<ParaStyle:' + blockStyles[b] + '>').replace('</' + blockStyles[b] + '>', '\r');
            var tempStartBlockTag = '<' + blockStyles[b] + '>';
            var tempEndBlockTag = '</' + blockStyles[b] + '>';
            htmlText = htmlText.replace(new RegExp(tempStartBlockTag, 'g'), '<ParaStyle:' + blockStyles[b] + '>').replace(new RegExp(tempEndBlockTag, 'g'), '\r');
        }
    }

    console.log('Tagged Text: ' + htmlText);

    // create temp file and save tagged text to it
    var porkyTempHTMLFile = new File(File('~').fsName + '/porky-temp-' + Date.now() + '.html');
    porkyTempHTMLFile.open('w');
    porkyTempHTMLFile.encoding = 'UTF-16';
    porkyTempHTMLFile.lineFeed = 'Unix';
    porkyTempHTMLFile.write('\uFEFF');

    // writing prefix – adding \r is necessary if you place html content with a leading block element into a tagged [object Text]
    var isWritten = porkyTempHTMLFile.write('<UNICODE-MAC>\n\r' + htmlText);
    var isClosed = porkyTempHTMLFile.close();
    // place tagged text, InDesign will do the formatting automatically based on existing styles
    try {
        console.log('Placing tagged text file ' + porkyTempHTMLFile);
        // place temp tagged text file
        targetObject.place(porkyTempHTMLFile);
        // and remove it
        porkyTempHTMLFile.remove();
    } catch (e) {
        console.log('Error: cannot place html file! ' + e);
        return false;
    }

    // cleanup
    targetObject = searchReplaceTextframe(targetObject, '[LF]', '\n');

    return targetObject;
}


function placeholderToInlineImage(targetObject, localImageFolder, downloadImage, httpSourcePort) {
    /*
    searches strings in this format and replaces them with images:
    [img]/localfolder/image-name.jpg[/img]
    or
    [img]http://remote-url/image-name.jpg[/img]

    downloads remote images into localImageFolder if downloadImage=true
    or just uses localImageFolder if downloadImage=false

    httpSourcePort is the port which is used for downloading the image from the http server

    targetObject is the frame object which is searched for placeholders
    */
    if (httpSourcePort === '') {
        httpSourcePort = '80';
    }
    if (downloadImage === '') {
        downloadImage = false;
    }
    app.findGrepPreferences = app.changeGrepPreferences = null;
    // app.findGrepPreferences.findWhat = '\\[porky-img\\].+?\\[\\/porky-img\\]';
    app.findGrepPreferences.findWhat = '\\[img\\].+?\\[\\/img\\]';
    try {
        var myFoundItems = targetObject.findGrep();
        for (var i = 0; i < myFoundItems.length; i++) {
            var tempRawPlaceholderFilename = myFoundItems[i].contents.toString();
            // var tempCleanPlaceholderFilename = tempRawPlaceholderFilename.replace(/\[porky-img](.*?)\[\/porky-img]/g, '$1');
            var tempCleanPlaceholderFilename = tempRawPlaceholderFilename.replace(/\[img](.*?)\[\/img]/g, '$1');
            var tempLocalImage = '';
            if (downloadImage) {
                // true = download and use external images
                console.log('Download and use external images');
                if (tempCleanPlaceholderFilename.substr(0, 7) != 'http://') {
                    tempCleanPlaceholderFilename = 'http://' + tempCleanPlaceholderFilename;
                }
                // download file into image folder
                tempLocalImage = httpGetBinaryFile(tempCleanPlaceholderFilename, httpSourcePort, localImageFolder);
            } else if (!downloadImage) {
                // use local images
                console.log('Use local images');
                tempLocalImage = new File(localImageFolder + '/' + tempCleanPlaceholderFilename);
            }
            if (tempLocalImage.exists) {
                myFoundItems[i].place(tempLocalImage);
            } else {
                console.log('Error: image does not exist');
                return false;
            }
        }
        app.findGrepPreferences = app.changeGrepPreferences = null;
        return targetObject;
    } catch (e) {
        app.findGrepPreferences = app.changeGrepPreferences = null;
        console.log(e);
        return false;
    }
}
