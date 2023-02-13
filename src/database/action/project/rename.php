<?php
	require_once __DIR__ . "/../getProjectFromUserData.php";
	if (!isset($_POST['title'])) die(createErrorResponse(E_INVALID_PARAMETERS));
	$result = $project->rename($_POST['title']);
	
	if (isError($result)) die(createErrorResponse($result));
	echo createResponse($project->export());
?>