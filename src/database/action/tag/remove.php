<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/tagComponent.php";
	if (!isset($_POST['tagId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_id = (string)$_POST['tagId'];
	$Manager = new TagComponent($project);
	echo createResponse($Manager->remove($_id));
?>