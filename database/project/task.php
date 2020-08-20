<?php
	$AllowedMethods = ["get", "getByGroup", "getByDateRange", "update", "remove"];
	require_once __DIR__ . "/../modules/app.php";




	$_projectId 	= (String)$_POST["projectId"];
	$_method 		= (String)$_POST["method"];
	$_parameters 	= urldecode((String)$_POST["parameters"]);
	
	if (!$_projectId || !$_method) die("Invalid request");

	$parameters = filterParameters($_parameters);
	
	$projects = $App->getAllProjects();
	if (!$projects || sizeof($projects) == 0) die("E_projectNotFound");


	$results = array();
	foreach ($projects as $project)
	{	
		if ($project->id != $_projectId && $_projectId != "*") continue;
		$projectResult = applyActionByProject($project, $_method, $parameters, $AllowedMethods);
		
		if (!$projectResult) continue;
		array_push($results, $projectResult);
	}

	if ($_method == "getByDateRange") die(json_encode(mergeDateArrays($results)));
	if ($_projectId == "*" && $_method != "get") die(json_encode($results));
	echo json_encode($results[0]);


	function applyActionByProject($_project, $_method, $_parameters, $_AllowedMethods) {	
		if (!in_array($_method, $_AllowedMethods)) die("E_invalidMethod");	

		$result = $_project->tasks->{$_method}($_parameters);
		return $result;
	}



	function mergeDateArrays($results) {
		$newDateArray = [];
		for ($p = 0; $p < sizeof($results); $p++)
		{
			$projectResult = $results[$p];
			if (!$projectResult || is_string($projectResult)) continue;
			$keys = array_keys($projectResult);
			for ($k = 0; $k < sizeof($keys); $k++)
			{
				$key = $keys[$k];
				if (array_key_exists($key, $newDateArray))
				{
					$newDateArray[$key] = array_merge($newDateArray[$key], $projectResult[$key]);
				} else $newDateArray[$key] = $projectResult[$key];
			}
		}
		return $newDateArray;
	}



	function filterParameters($_parString) {
		$decodedParameters = $_parString; //urldecode($_parString);
		$parameters = "";
		try {
			$parameters = json_decode($decodedParameters, true);
		}
		catch (Exception $e) {
			$parameters = $decodedParameters;
		}
		if ($parameters == NULL) $parameters = $decodedParameters;

		return $parameters;
	}
?>