<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/../modules/app.php";

	$_projectId 	= (String)$_POST["projectId"];
	$project 		= $App->getProject($_projectId);
	
	if (!$project) 				die("E_projectNotFound");
	if (is_string($project)) 	die($project);
	
	echo $project->remove();
?>