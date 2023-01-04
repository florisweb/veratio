<?php
	require_once __DIR__ . "/../modules/app.php";

	if (!isset($_POST["projectId"])) die(json_encode(array("error" => "E_invalidRequest", "result" => false)));
	$_projectId = (String)$_POST["projectId"];
	$project = $GLOBALS["App"]->getProject($_projectId);
	if (!$project || is_string($project)) die(json_encode(array("error" => $project, "result" => false)));
	
	$projectTasks = array(
		"overdue" 	=> $project->tasks->getByGroup(array("type" => "overdue", "value" => "*")),
		"toPlan" 	=> $project->tasks->getByGroup(array("type" => "toPlan", "value" => "*")),
		"default"	=> $project->tasks->getByGroup(array("type" => "default", "value" => "*")),
		"planned" 	=> $project->tasks->getByDateRange(array("date" => date('d-m-Y'), "range" => 365)),
	);

	echo json_encode(array(
		"error" => false,
		"result" => $projectTasks
	));
?>