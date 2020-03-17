<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/../modules/app.php";

	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0) createWelcomeProject();

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
	echo json_encode($returnProjects);


	function createWelcomeProject() {
		$GLOBALS["App"]->createProject("Introduction");
		$projects = $GLOBALS["App"]->getAllProjects();
		if (sizeof($projects) == 0) return;

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
		$introProject->todos->update([
			"title" => "5 - If you have any questions, would like to suggest a feature or report a bug, feel free to mail to: veratio@florisweb.tk", "id" => "6", "groupType" => "default"
		]);
	}
?>