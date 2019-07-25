<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$projects = $App->getAllProjects();
	$returnProjects = array();
	for ($i = 0; $i < sizeof($projects); $i++)
	{
		$curProject = array();
		$curProject["id"] 		= $projects[$i]->id;
		$curProject["title"] 	= $projects[$i]->title;
		array_push($returnProjects, $curProject);
	}
	echo json_encode($returnProjects);
?>