<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0)
	{
		$App->createProject("Introduction");
		$projects = $App->getAllProjects();
		$introProject = $projects[0];
		$introProject->todos->update([
			"title" => "0: Thanks for using Veratio", "id" => "1", "groupType" => "default"
		]);
		$introProject->todos->update([
			"title" => "1: Let's get started", "id" => "2", "groupType" => "default"
		]);
		$introProject->todos->update([
			"title" => "2 - Let's create a project using the 'Create project' button on the left side of the screen.", "id" => "3", "groupType" => "default"
		]);
		$introProject->todos->update([
			"title" => "3 - Add some tasks to that project", "id" => "4", "groupType" => "default"
		]);
		$introProject->todos->update([
			"title" => "4 - And while you're at it, perhaps even invite some friends using the 'share' button in the upper right.", "id" => "5", "groupType" => "default"
		]);
	}



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