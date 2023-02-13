<?php
	require_once __DIR__ . "/../checkAuth.php";
	if (!isset($_POST['title'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$project = $CurUser->createProject($_POST['title']);
	if (isError($project)) die(createErrorResponse($project));
	echo createResponse($project->export());
?>