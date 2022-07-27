<?php
	require_once __DIR__ . "/../modules/Project.php";
	require_once __DIR__ . "/../modules/CurUser.php";
	require_once __DIR__ . "/../modules/taskComponent.php";


		
	if (!$CurUser->isSignedIn) die(createErrorResponse(E_NO_AUTH));
	if (!isset($_GET['projectId']) || !isset($_GET['task'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_projectId = $_GET['projectId'];
	$project 	= new Project($_projectId);
	if (!$project->projectExists()) die(createErrorResponse(E_PROJECT_NOT_FOUND));
	if (!$project->userInProject($CurUser)) die(createErrorResponse(E_USER_NOT_IN_PROJECT));


	$taskManager = new TaskComponent($project);
	$taskArray = decodeJSON($_GET['task'], false);
	if (!$taskArray) die(createErrorResponse(E_INVALID_PARAMETERS));
	$task = new Task(arrayToObject($taskArray));

	$result = $taskManager->update($task);
	if ($result instanceof Task) $result = $result->toArray();
	echo createResponse($result);
?>