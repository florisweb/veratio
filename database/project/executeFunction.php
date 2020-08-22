<?php
	define("AllowedMethods", [
		"tasks"		=> ["get", "getByGroup", "getByDateRange", "update", "remove"],
		"tags" 		=> ["get", "getAll", "update", "remove"],
		"users" 	=> ["update", "remove", "getAll", "inviteByEmail", "inviteByLink"],
		"project" 	=> ["rename", "remove", "create", "getAll"],
	]);

	require_once __DIR__ . "/../modules/app.php";


	// $_functionData			= (String)$_POST["function"];
	$_functionData			= (String)$_GET["function"];
	if (!$_functionData) 	die("Parameters missing");
	
	$_functionData 			= json_decode(urldecode($_functionData), true);
	if (!$_functionData) 	die("Invalid function");


	$functionData = validateFunction($_functionData);
	if (is_string($functionData)) die($functionData);


	echo json_encode(callFunction($functionData));




	function validateFunction($_functionData) {
		$fData = [
			"type" 			=> (string)$_functionData["type"],
			"action" 		=> (string)$_functionData["action"],
			"projectId" 	=> (string)$_functionData["projectId"],
		];

		if (!in_array(
			$fData["type"], 
			array_keys(AllowedMethods)
		)) return "E_invalidType";

		if (!in_array(
			$fData["action"], 
			AllowedMethods[$fData["type"]]
		)) return "E_invalidAction";


		$fData["parameters"] = $_functionData["parameters"]; // TODO Should be filtered

		return $fData;
	}



	function callFunction($_functionData) {
		$project = $GLOBALS["App"]->getProject((string)$_functionData["projectId"]);

		if ($_functionData["type"] == "project")
		{
			switch ($_functionData["action"])
			{
				case "rename": 
					if (!$project || is_string($project)) return "E_invalidProjectId";
					return $project->rename($_functionData["parameters"]); 
				break;
				case "rename": 
					if (!$project || is_string($project)) return "E_invalidProjectId";
					return $project->remove(); 
				break;
				case "rename": 
					return $GLOBALS["App"]->createProject($_functionData["parameters"]);
				break;
				case "getAll": 
					return $GLOBALS["App"]->getAllProjects();
				break;
			}
			return "E_invalidAction";
		}

		if (!$project || is_string($project)) return "E_invalidProjectId";

		return $project->{$_functionData["type"]}->{$_functionData["action"]}($_functionData["parameters"]);
	}


?>