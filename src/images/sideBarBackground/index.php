<?php
	$type = (String)$_GET["type"];
	$mainPath = "*.png";

	switch ($type)
	{
		case "landscape": $mainPath = "landscape/" . $mainPath; break;
		default: $mainPath = "sidebar/" . $mainPath; break;
	}
	$filePaths = glob("backgrounds/" . $mainPath);
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