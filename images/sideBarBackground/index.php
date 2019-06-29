<?php
	$type = (String)$_GET["type"];
	$mainPath = "/*.*";

	switch ($type)
	{
		case "landscape": $mainPath = "landscape" . $mainPath; break;
		default: $mainPath = "sideBar" . $mainPath; break;
	}

	$filePaths = array();
	foreach (glob("backgrounds/" . $mainPath) as $file) 
	{
		array_push($filePaths, $file);
	}

	$fileIndex = rand(0, sizeof($filePaths) - 1);
	$filePath = $filePaths[$fileIndex];
	$file = fopen($filePath, "r");

	header('Content-Disposition: attachment; filename="background.png"');
	header('Content-Type: image/png'); 
	header('Content-Length: ' . filesize($filePath));
	header('Connection: close');
 
	echo fread($file, filesize($filePath));
	fclose($file);
?>