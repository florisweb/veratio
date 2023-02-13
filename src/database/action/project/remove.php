<?php
	require_once __DIR__ . "/../getProjectFromUserData.php";

	$result = $project->remove();
	echo createResponse($result);
?>