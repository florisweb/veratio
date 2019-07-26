<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$_projectId 	= (String)$_POST["projectId"];
	$_newTitle	 	= urldecode((String)$_POST["newTitle"]);
	$project 		= $App->getProject($_projectId);
	
	if (!$_newTitle)			die("E_noTitleProvided");
	if (!$project) 				die("E_projectNotFound");
	if (is_string($project)) 	die($project);

	echo $project->rename($_newTitle);
?>