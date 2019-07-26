<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";
	

	$_inviteLink = (string)$_GET["link"];
	$_joinType = (string)$_GET["type"];
	if (!$_inviteLink || strlen($_inviteLink) > 50 || !$_joinType) die("E_invalidLink");
	

	$App = new _App($_inviteLink);
	
	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0) die("E_projectNotFound");
	$project = $projects[0];

	$inviteUserObj = $project->users->get($_inviteLink);
	if (!$inviteUserObj || $inviteUserObj["type"] != "invite") die("E_userNotFound");
	

	if ($_joinType == "signedIn")
	{
		$project->users->InviteComponent->joinAsMember($_inviteLink, $inviteUserObj);
		header("Location: /git/todo");
	} else {
		$project->users->InviteComponent->joinAsLink($_inviteLink, $inviteUserObj);
		header("Location: /git/todo?link=" . $_inviteLink);
	}
	
	die("Redirect user");
?>