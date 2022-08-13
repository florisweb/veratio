<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/taskComponent.php";
	if (!isset($_GET['groupType']) || !isset($_GET['groupValue'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$Manager = new TaskComponent($project);
	$result = $Manager->getByGroup($_GET['groupType'], $_GET['groupValue']);
	$output = [];

	if (is_array($result))
	{
		foreach ($result as $task)
		{
			array_push($output, $task->toArray());
		}
		die(createResponse($result));
	}
	echo createResponse($result);
?>