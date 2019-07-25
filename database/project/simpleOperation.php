<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";

	$_projectId 	= (String)$_POST["projectId"];
	$_dataType 		= (String)$_POST["dataType"];
	$_method 		= (String)$_POST["method"];
	$_parameter 	= urldecode((String)$_POST["parameter"]);
	
	if (!$_projectId || !$_dataType || !$_method) die("Invalid request");

	$project = $App->getProject($_projectId);
	if (!$project || $project == "project_notFound") die("E_projectNotFound");

	
	$target = null;
	switch ($_dataType)
	{
		case "todos": $target = $project->todos; break;
		case "users": $target = $project->users; break;
		case "tags":  $target = $project->tags;  break;
		default: die("E_invalidDataType"); break;
	}
	if (!$target) die("E_invalidDataType");

	
	$firstMethods = get_class_methods($target);
	if (!$firstMethods) die("E_invalidMethod");
	$methodOptions = array_splice($firstMethods, 1, 100);
	if (!in_array($_method, $methodOptions)) die("E_invalidMethod");


	try {
		$parameter = json_decode($_parameter, true);
	}
	catch (Exception $e) {
		$parameter = $_parameter;
	}
	if ($parameter == NULL) $parameter = $_parameter;
	

	$result = $target->{$_method}($parameter);
	echo json_encode($result);
?>