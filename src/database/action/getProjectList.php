<?php
	require_once __DIR__ . "/../modules/Project.php";
	require_once __DIR__ . "/../modules/CurUser.php";
	
	if (!$CurUser->isSignedIn) die(createErrorResponse(E_NO_AUTH));

	$projects = $CurUser->getProjectList();

	$output = array();
	foreach ($projects as $project)
	{
		array_push($output, $project->export());
	}

	echo createResultResponse($output);
?>