<?php
	require __DIR__ . '/../../checkAuth.php'; // Checks whether the user is signed in.
	require_once __DIR__ . "/../../../modules/taskComponent.php";
	if (!isset($_POST['date']) || !isset($_POST['range'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_date = (string)$_POST['date'];
	$_range = (int)$_POST['range'];

	if ($_range < 0) die(createErrorResponse(E_INVALID_PARAMETERS));

	$output = [];
	$projects = $CurUser->getProjectList();
	foreach ($projects as $project)
	{
		$Manager = new TaskComponent($project);
		$result = $Manager->getByDateRange($_date, $_range);
		if (is_array($result))
		{
			foreach ($result as $task)
			{
				array_push($output, $task->toArray());
			}
		}
	}

	echo createResponse($output);
?>