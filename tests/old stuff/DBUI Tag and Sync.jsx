/*
BASICS
© 2009 - 2012 Oliver Grünberg
www.DBUI.de
*/

//#target indesign;
#targetengine "session"
#include ./DBUILoader.jsx;


function DBUICreateDialog(){
	this.windowRef = null;
}

DBUICreateDialog.prototype.run = function(){
	var win = new Window("palette", "DBUI Tag & Sync",[100, 100, 320, 335]); // bounds = [left, top, right, bottom]
	this.windowRef = win;

	win.DBUIPanel = win.add("panel", [0, 0, 221, 236], undefined);

	win.DBUIPanel.SyncBtn = win.DBUIPanel.add("button", [15, 15, 200, 45], "Recursive sync!");//[Links, Oben, rechts, unten]
	win.DBUIPanel.SyncScriptName = win.DBUIPanel.add("edittext", [15, 75, 200, 105], "YourSyncScript.jsx");//[Links, Oben, rechts, unten]
	win.DBUIPanel.TagBtn = win.DBUIPanel.add("button", [15, 110, 150, 140], "Tag this!");//[Links, Oben, rechts, unten]
	win.DBUIPanel.SyncIdentifierValue = win.DBUIPanel.add("edittext", [155, 110, 200, 140], "123");//[Links, Oben, rechts, unten]
	win.DBUIPanel.UntagBtn = win.DBUIPanel.add("button", [15, 145, 150, 175], "Untag this!");//[Links, Oben, rechts, unten]
	win.DBUIPanel.SyncFolderBtn = win.DBUIPanel.add("button", [15, 200, 150, 225], "SyncScript folder");//[Links, Oben, rechts, unten]

	win.DBUIPanel.SyncBtn.onClick = function(){
		SyncIdentifier = win.DBUIPanel.SyncIdentifierValue.text;
		SyncScriptFolder = SyncScriptFolder + "/";
		for(s=0;s < app.selection.length; s++){
			try{
				RecursiveSyncFrame(app.selection[s]);
			}catch(e){
				alert(e, "DBUI");
			}
		}
	};

	win.DBUIPanel.TagBtn.onClick = function(){
		//alert(win.DBUIPanel.SyncScriptName.text);
		if(win.DBUIPanel.SyncScriptName.text != "" && win.DBUIPanel.SyncIdentifierValue.text != ""){
			TagThis(app.selection[0], win.DBUIPanel.SyncScriptName.text, win.DBUIPanel.SyncIdentifierValue.text);
		}else{
			alert("Empty values are not allowed!", "DBUI");
		}
	};

	win.DBUIPanel.UntagBtn.onClick = function(){
		//alert(app.selection[0]);
		if(app.selection[0] == "[object Word]" || app.selection[0] == "[object Paragraph]" || app.selection[0] == "[object InsertionPoint]" || app.selection[0] == "[object Character]" || app.selection[0] == "[object Text]" || app.selection[0] == "[object TextColumn]"){
			app.selection[0].associatedXMLElements[0].untag();
		}
		if(app.selection[0] == "[object Rectangle]" || app.selection[0] == "[object TextFrame]"){
			app.selection[0].associatedXMLElement.untag();
		}
	};

	win.DBUIPanel.SyncFolderBtn.onClick = function(){
		SyncScriptFolder = Folder.selectDialog("Select the folder with SyncScripts to process");
	};

	win.show();
		
	return true;		
}

if(typeof(DBUICreateDialog_unitTest) == "undefined"){
	new DBUICreateDialog().run();
}


