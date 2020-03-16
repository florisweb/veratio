<?php
	function APP_noAuthHandler() {}
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";
	

	$_inviteUser_placeholderId = sha1((string)$_GET["link"]);
	$_joinType = (string)$_GET["type"];
	if (!$_inviteUser_placeholderId || strlen($_inviteUser_placeholderId) > 50 || !$_joinType) die("E_invalidLink");
	

	$App->userId = (string)$_inviteUser_placeholderId;
	
	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0) die("E_projectNotFound");
	$project = $projects[0];

	$inviteUserObj = $project->users->get($_inviteUser_placeholderId);
	if (!$inviteUserObj || $inviteUserObj["type"] != "invite") die("E_userNotFound");
	

	if ($_joinType == "signedIn")
	{
		$project->users->InviteComponent->joinAsMember((string)$_GET["link"], $inviteUserObj);
		header("Location: https://veratio.florisweb.tk");
	} else {
		$project->users->InviteComponent->joinAsLink((string)$_GET["link"], $inviteUserObj);
		header("Location: https://veratio.florisweb.tk?link=" . $_inviteUser_placeholderId);
	}
	
	die("Redirect user");
?>