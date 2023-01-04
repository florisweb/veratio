<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/taskComponent.php";
	if (!isset($_POST['date']) || !isset($_POST['range'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_date = (string)$_POST['date'];
	$_range = (int)$_POST['range'];

	if ($_range < 0) die(createErrorResponse(E_INVALID_PARAMETERS));

	$Manager = new TaskComponent($project);
	$result = $Manager->getByDateRange($_date, $_range);
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