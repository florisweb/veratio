<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/../modules/app.php";

	$projects = $App->getAllProjects();
	if (is_string($projects))
	{
		$response = array(
			"error" => $projects,
			"result" => false,
		);

		die(json_encode($response));
	}



	if (sizeof($projects) == 0)
	{
		$GLOBALS["App"]->createProject("Your first project");
		$projects = $App->getAllProjects();
	}

	$returnProjects = array();
	for ($i = 0; $i < sizeof($projects); $i++)
	{
		$curProject = array();
		$curProject["id"] 		= $projects[$i]->id;
		$curProject["title"] 	= urlencode($projects[$i]->title);
		$curProject["users"]	= $projects[$i]->users->getAll();
		$curProject["tags"]		= $projects[$i]->tags->getAll();

		array_push($returnProjects, $curProject);
	}

	$response = array(
		"error" => false,
		"result" => $returnProjects
	);

	echo json_encode($response);
?>