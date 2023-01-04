<?php
	require_once __DIR__ . "/checkAuth.php";
	if (!isset($_POST['projectId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_projectId = $_POST['projectId'];
	$project 	= new Project($_projectId);
	if (!$project->projectExists()) die(createErrorResponse(E_PROJECT_NOT_FOUND));
	if (!$project->userInProject($CurUser)) die(createErrorResponse(E_USER_NOT_IN_PROJECT));
	$project->setCurUser($CurUser);
?>