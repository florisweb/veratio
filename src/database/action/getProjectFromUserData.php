<?php
	require_once __DIR__ . "/../modules/Project.php";
	require_once __DIR__ . "/../modules/CurUser.php";
		
	if (!$CurUser->isSignedIn) die(createErrorResponse(E_NO_AUTH));
	if (!isset($_GET['projectId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_projectId = $_GET['projectId'];
	$project 	= new Project($_projectId);
	if (!$project->projectExists()) die(createErrorResponse(E_PROJECT_NOT_FOUND));
	if (!$project->userInProject($CurUser)) die(createErrorResponse(E_USER_NOT_IN_PROJECT));
?>