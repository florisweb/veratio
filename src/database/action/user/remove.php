<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/userComponent.php";
	if (!isset($_POST['userId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_id = (string)$_POST['userId'];
	$Manager = new UserComponent($project);
	echo createResponse($Manager->remove($_id));
?>