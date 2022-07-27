<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/userComponent.php";
	if (!isset($_GET['userId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_id = (string)$_GET['userId'];
	$Manager = new UserComponent($project);
	echo createResponse($Manager->remove($_id));
?>