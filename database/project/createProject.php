<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$_projectTitle 	= urldecode((String)$_POST["title"]);
	if (!$_projectTitle) die("E_invalidTitle");


	$projectId = $App->createProject($_projectTitle);
	if (!$projectId) die("E_projectNotCreated");

	$project = $App->getProject($projectId);
	if (!$project) die("E_projectNotCreated");

	unset($project->errorOnCreation);
	unset($project->users);
	unset($project->todos);
	unset($project->tags);
	
	echo json_encode($project);
?>