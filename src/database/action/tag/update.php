<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/tagComponent.php";
	if (!isset($_GET['tag'])) die(createErrorResponse(E_INVALID_PARAMETERS));

	$tagArray = decodeJSON($_GET['tag'], false);
	if (!$tagArray) die(createErrorResponse(E_INVALID_PARAMETERS));
	$tag = new Tag(arrayToObject($tagArray));

	$Manager = new TagComponent($project);
	$result = $Manager->update($tag);
	if ($result instanceof Tag) $result = $result->toArray();
	echo createResponse($result);
?>