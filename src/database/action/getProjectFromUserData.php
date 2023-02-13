<?php
	require_once __DIR__ . "/checkAuth.php";
	if (!isset($_POST['projectId'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$_projectId = $_POST['projectId'];
	$project = $CurUser->getProject($_projectId);
	if (isError($project)) die(createErrorResponse($project));
?>