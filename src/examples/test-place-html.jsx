//@include ../bin/porky.jsx;

var tempFrameObject = addFrame(20, 20, 180, 295, '');
var myHTML = '<h1>InDesign<sup>®</sup> JavaScript library & database interface</h1>';
	myHTML = myHTML + '<p><img src="http://31.media.tumblr.com/311b4945fde244b8f537937ba2d43235/tumblr_inline_ng0m9dHLVu1t4xahi.png"></p>';
	myHTML = myHTML + '<p><b>porky</b> ist eine plattform unabhängige JavaScript Bibliothek und Datenbank Schnittstelle für Adobe<sup>®</sup> InDesign® und andere Adobe<sup>®</sup> Produkte, die mit dem Adobe-eigenen ESTK (ExtendScript Toolkit) arbeiten.</p>';
	myHTML = myHTML + '<p>Mit <b>porky</b> vereinfacht man wiederkehrende Programmieraufgaben wesentlich und ist so in der Lage, komplette Publishing Workflows zu erstellen.</p>';
	myHTML = myHTML + '<p><b>porky</b> <i>ist freie Open Source Software</i> und unter der <i>MIT Lizenz</i> veröffentlicht. <b>porky</b> enthält eine Basisausstattung von sogenannten Core-Funktionen – dies sind oft benötigte Funktionalitäten für wiederkehrende Programmieraufgaben.</p>';
	myHTML = myHTML + '<p>Die Veröffentlichung von <b>porky</b> als Open Source Projekt bei GitHub ermöglicht es, dass das Projekt von einer weltweiten Zielgruppe von Programmierern aktiv weiterentwickelt wird.</p>';
	myHTML = myHTML + '<p><b>porky</b> ist erweiterbar – die Funktionsbibliothek kann ganz einfach um zusätzliche Funktionalitäten erweitert werden indem man JavaScript Code in der lokal verwendeten Quellcode-Datei anhängt oder einen Pull-Request im GitHub Projekt startet.</p>';
	myHTML = myHTML + '<h2>Unsortierte Liste</h2><ul><li>bla bla bla bla bla bla</li><li>bla bla bla bla bla bla</li><li>bla bla bla bla bla bla</li></ul>';
	myHTML = myHTML + '<h2>Sortierte Liste</h2><ol><li>Eins bla blub blib</li><li>Zwei bla blub blib</li><li>Drei bla blub blib</li></ol>';
	myHTML = myHTML + '<table><tr><td>Das</td><td>ist</td><td>porky</td></tr><tr><td>porky</td><td>ist</td><td>cool</td></tr></table>';

// use InDesign's place() functionality to place html content
// tags forwarded as attributes will be created automatically as character/paragraph styles inside the layout document
// placeHTML(targetObject, htmlText, inlineStyles, blockStyles)
tempFrameObject = placeHTML(tempFrameObject, myHTML, 'b, i, br, img, sup', 'h1, h2, p, ol, ul, table, tr, td');

alert('Check your textframe\nimage tag will be replaced by downloaded image...');

// download and place images from url placeholders
tempFrameObject = placeholderToInlineImage(tempFrameObject, '~/Desktop/', true, '80');