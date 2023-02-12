<?php
	require __DIR__ . '/../../checkAuth.php'; // Checks whether the user is signed in.
	require_once __DIR__ . "/../../../modules/taskComponent.php";
	if (!isset($_POST['groupType']) || !isset($_POST['groupValue'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$output = [];
	$projects = $CurUser->getProjectList();
	foreach ($projects as $project)
	{
		$Manager = new TaskComponent($project);
		$result = $Manager->getByGroup($_POST['groupType'], $_POST['groupValue']);
		if (!is_array($result)) continue;
		
		foreach ($result as $task)
		{
			array_push($output, $task->toArray());
		}
	}


	echo createResponse($output);
?>