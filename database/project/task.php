<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$_projectId 	= (String)$_POST["projectId"];
	$_method 		= (String)$_POST["method"];
	$_parameters 	= urldecode((String)$_POST["parameters"]);
	
	if (!$_projectId || !$_method) die("Invalid request");

	try {
		$parameters = json_decode($_parameters, true);
	}
	catch (Exception $e) {
		$parameters = $_parameters;
	}
	if ($parameters == NULL) $parameters = $_parameters;

	
	$projects = $App->getAllProjects();
	if (!$projects || sizeof($projects) == 0) die("E_projectNotFound");
	
	$results = array();
	foreach ($projects as $project)
	{	
		if ($project->id != $_projectId && $_projectId != "*") continue;
		$projectResult = applyActionByProject($project, $_method, $parameters);
		
		if (!$projectResult) continue;
		$results[$project->id] = $projectResult;
	}

	echo json_encode($results);


	function applyActionByProject($_project, $_method, $_parameters) {	
		$target = $_project->todos;

		$firstMethods 		= get_class_methods($target);
		if (!$firstMethods) die("E_invalidMethod");

		$methodOptions 		= array_splice($firstMethods, 1, 100);
		if (!in_array($_method, $methodOptions)) die("E_invalidMethod");

		
		$result = $target->{$_method}($_parameters);
		return $result;
	}
?>