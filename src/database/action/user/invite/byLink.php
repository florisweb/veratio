<?php
	require __DIR__ . '/../../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../../modules/inviteComponent.php";
	$Manager = new InviteComponent($project);
	$result = $Manager->inviteByLink();
	echo createResponse($result);
?>