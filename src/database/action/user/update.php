<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/userComponent.php";
	if (!isset($_GET['user'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$userArray = decodeJSON($_GET['user'], false);
	if (!$userArray) die(createErrorResponse(E_INVALID_PARAMETERS));
	$user = new User(arrayToObject($userArray));

	$Manager = new UserComponent($project);
	$result = $Manager->update($user);
	if ($result instanceof User) $result = $result->toArray();
	echo createResponse($result);
?>