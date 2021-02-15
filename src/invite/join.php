<?php
	function APP_noAuthHandler() {}
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/../database/modules/app.php";
	
	$link = $_COOKIE["veratio_inviteLink"];
	if (!$link) $link = (string)$_GET["link"];
	if (!$link) die("E_invalidLink");


	// Set the authentication cookie
	if (isset($_GET["sessionKey"])) 
	{
		setcookie("SESSION_key", (String)$_GET["sessionKey"], time() + (60 * 60 * 24 * 365.25), "/");
	}

	var_dump("link:" . $link);

	$App->userId = sha1((string)$link);
	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0) die("E_projectNotFound");
	$project = $projects[0];

	$inviteUserObj = $project->users->get($App->userId);
	if (!$inviteUserObj || $inviteUserObj["type"] != "invite") die("E_userNotFound");



	$signedIn = !!$GLOBALS["SESSION"]->get("userId");
	echo "Signed in: "; var_dump($signedIn);

	if ($signedIn)
	{
		$project->users->InviteComponent->joinAsMember($link, $inviteUserObj);
		header("Location: /");
		die();
	}

	setcookie("veratio_inviteLink", $link, time() + 120, "/");
	
	header("Location: https://florisweb.tk/user/login.php?APIKey=veratioV1.3_join");
	die("Redirect user");
?>