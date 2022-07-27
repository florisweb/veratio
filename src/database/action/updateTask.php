<?php
	require __DIR__ . '/getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../modules/taskComponent.php";
	if (!isset($_GET['task'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$taskManager = new TaskComponent($project);
	$taskArray = decodeJSON($_GET['task'], false);
	if (!$taskArray) die(createErrorResponse(E_INVALID_PARAMETERS));
	$task = new Task(arrayToObject($taskArray));

	$result = $taskManager->update($task);
	if ($result instanceof Task) $result = $result->toArray();
	echo createResponse($result);
?>