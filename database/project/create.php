<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$_projectTitle 	= urldecode((String)$_POST["title"]);
	if (!$_projectTitle) die("E_invalidTitle");


	$projectId = $App->createProject($_projectTitle);
	if (!$projectId) die("E_projectNotCreated");
	
	$project = $App->getProject($projectId);
	if (!$project || is_string($project)) die("E_projectNotCreated");


	$projectReturnObj = array(
		"title" => urlencode($project->title),
		"id" 	=> $project->id,
	);
	
	echo json_encode($projectReturnObj);
?>