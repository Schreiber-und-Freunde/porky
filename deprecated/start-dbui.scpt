tell application "Finder"
	set fileAlias to the selection as alias
	set fileName to name of fileAlias
	set folderName to container of fileAlias as text
	set scriptPath to POSIX path of folderName
	set fileExtension to name extension of fileAlias
	set theFile to selection
	#display dialog scriptPath
	display dialog "Start DBUI?"
end tell


tell application "Terminal"
	do shell script "php " & scriptPath & "DBUI-2.0.php"
	#do shell script "php " & scriptPath & "DBUI-2.0.php"
end tell