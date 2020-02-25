<?php
	$AllowedMethods = ["get", "getByGroup", "getByDate", "getByDateRange", "update", "remove"];
	require_once __DIR__ . "/../modules/app.php";



	

	$_projectId 	= (String)$_POST["projectId"];
	$_method 		= (String)$_POST["method"];
	$_parameters 	= urldecode((String)$_POST["parameters"]);
	
	if (!$_projectId || !$_method) die("Invalid request");

	$project = $App->getProject($_projectId);
	if (!$project || $project == "project_notFound") die("E_projectNotFound");
	
	try {
		$parameters = json_decode($_parameters, true);
	}
	catch (Exception $e) {
		$parameters = $_parameters;
	}
	if ($parameters == NULL) $parameters = $_parameters;

	
	if (!in_array($_method, $AllowedMethods)) die("E_invalidMethod");

	$result = $project->tags->{$_method}($parameter);
	echo json_encode($result);
?>