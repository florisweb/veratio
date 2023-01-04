<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/taskComponent.php";
	if (!isset($_POST['task'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$taskArray = decodeJSON($_POST['task'], false);
	if (!$taskArray) die(createErrorResponse(E_INVALID_PARAMETERS));
	$task = new Task(arrayToObject($taskArray));

	$Manager = new TaskComponent($project);
	$result = $Manager->update($task);
	if ($result instanceof Task) $result = $result->toArray();
	echo createResponse($result);
?>