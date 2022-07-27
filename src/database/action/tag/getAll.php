<?php
	require __DIR__ . '/../getProjectFromUserData.php'; // Does the necessery checks and writes to the $project variable
	require_once __DIR__ . "/../../modules/tagComponent.php";
	$tagManager = new TagComponent($project);

	$results = $tagManager->getAll();
	function toArray($_item) {
		return $_item->toArray();
	}
	echo createResponse(array_map('toArray', $results));
?>