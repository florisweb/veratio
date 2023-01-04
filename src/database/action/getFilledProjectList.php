<?php
	require_once __DIR__ . "/../modules/Project.php";
	require_once __DIR__ . "/../modules/tagComponent.php";
	require_once __DIR__ . "/../modules/CurUser.php";
	
	if (!$CurUser->isSignedIn) die(createErrorResponse(E_NO_AUTH));

	$projects = $CurUser->getProjectList();

	$output = array();
	foreach ($projects as $project)
	{
		$exportedProject = $project->export();
		$Manager = new TagComponent($project);
		$exportedProject['tags'] = $Manager->getAll();
		array_push($output, $exportedProject);
	}

	echo createResultResponse($output);
?>