<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/taskComponent.php";
	if (!isset($_GET['taskId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_taskId = (string)$_GET['taskId'];
	$Manager = new TaskComponent($project);
	echo createResponse($Manager->remove($_taskId));
?>