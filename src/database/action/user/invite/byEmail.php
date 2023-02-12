<?php
	require __DIR__ . '/../../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../../modules/inviteComponent.php";
	
	$Manager = new InviteComponent($project);
	if (!isset($_POST['email'])) die(createErrorResponse(E_INVALID_PARAMETERS));
	$result = $Manager->inviteByEmail($_POST['email']);
	echo createResponse($result);
?>