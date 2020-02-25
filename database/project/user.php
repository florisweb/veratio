<?php
	$AllowedMethods = ["update", "remove", "getAll", "inviteByEmail"];



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

	
	$project = $App->getProject($_projectId);
	if (!$project || is_string($project)) die("E_projectNotFound");
	if (!in_array($_method, $AllowedMethods)) die("E_invalidMethod");

	$result = $project->users->{$_method}($_parameters);
	echo json_encode($result);
?>