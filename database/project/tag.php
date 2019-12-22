<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$_projectId 	= (String)$_POST["projectId"];
	$_method 		= (String)$_POST["method"];
	$_parameters 	= urldecode((String)$_POST["parameters"]);
	
	if (!$_projectId || !$_method) die("Invalid request");

	$project = $App->getProject($_projectId);
	if (!$project || $project == "project_notFound") die("E_projectNotFound");

	
	$target = $project->todos;

	$firstMethods 		= get_class_methods($target);
	if (!$firstMethods) die("E_invalidMethod");
	$methodOptions 		= array_splice($firstMethods, 1, 100);
	if (!in_array($_method, $methodOptions)) die("E_invalidMethod");

	try {
		$parameter = json_decode($_parameters, true);
	}
	catch (Exception $e) {
		$parameter = $_parameters;
	}
	if ($parameter == NULL) $parameter = $_parameters;
	

	$result = $target->{$_method}($parameter);
	echo json_encode($result);
?>