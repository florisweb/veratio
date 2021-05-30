<?php
	function APP_noAuthHandler() {}
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/../database/modules/app.php";

	$link = (string)$_GET["link"];
	if (!$link) die("E_invalidLink");

	$App->userId = sha1((string)$link);
	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0) die("E_projectNotFound");
	$project = $projects[0];

	$inviteUserObj = $project->users->get($App->userId);
	if (!$inviteUserObj || ($inviteUserObj["type"] != "invite" && $inviteUserObj["type"] != "link")) die("E_userNotFound");

	$signedIn = !!$GLOBALS["SESSION"]->get("userId");
	if ($signedIn)
	{
		if ($inviteUserObj["type"] == "link")
		{
			$project->users->InviteComponent->bindAccount($link, $inviteUserObj);
		} else {
			$project->users->InviteComponent->joinAsMember($link, $inviteUserObj);
		}

		header("Location: /");
		die();
	}

	header("Location: https://user.florisweb.tk/login?redirect=https://veratiodev.florisweb.tk/invite/join.php?link=" . $link);
	die("Redirect user");
?>