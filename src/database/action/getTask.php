<?php
	require __DIR__ . '/getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../modules/taskComponent.php";
	if (!isset($_GET['taskId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_taskId = (string)$_GET['taskId'];
	$taskManager = new TaskComponent($project);

	$result = $taskManager->get($_taskId);
	if ($result instanceof Task) $result = $result->toArray();
	echo createResponse($result);
?>