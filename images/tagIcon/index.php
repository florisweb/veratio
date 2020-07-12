<?php
	$_tagId = (String)$_GET["tagId"];

	require __DIR__ . "/../../database/modules/app.php";

	$projects = $App->getAllProjects();

	$tag = false;
	foreach ($projects as $project)
	{
		$tag = $project->tags->get($_tagId);
		if (!$tag) continue;
		break;
	}
	if (!$tag) die("No tag found");


	header('Content-Disposition: attachment; filename="tagIcon.svg"');
	header('Content-Type: image/svg+xml'); 
	header('Connection: close');
 	

 	echo 	'<?xml version="1.0" standalone="no"?>
 			 <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 100 100" width="100" height="100">
  				<circle cx="50" cy="50" r="40" stroke="' . $tag["colour"] . '" stroke-width="5" fill="' . $tag["colour"] . '" fill-opacity=".5"/>
			</svg>';
?>