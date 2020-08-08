<?php
	// system that redirects the user to the welcome page if they're new
	if (!isset($_COOKIE["Veratio_hasSeenWelcomeMessage"]))
	{
		if ($_GET["link"])
		{
			header("Location: welcome?link=" . $_GET["link"]);
		} else header("Location: welcome");
		die("Redirecting");
	}
	
	$MessageIndex = $_COOKIE["Veratio_messageIndex"];
	setcookie("Veratio_messageIndex", 1, time() + (60 * 60 * 24 * 365.25), "/");


	$enableRedirect = false;
	function APP_noAuthHandler() {
		if (!$enableRedirect) return;
		header("Location: /user/login.php?redirect=/git/veratio");
		die("E_noAuth");
	}

	$root = realpath($_SERVER["DOCUMENT_ROOT"]);	
	require_once __DIR__ . "/database/modules/app.php";
	require_once __DIR__ . "/database/modules/garbageCollector/garbageCollector.php";


	$enableRedirect = true;

	$isLinkUser = authenticateLink();
	if ($isLinkUser == false) $GLOBALS["SESSION"]->clear("veratio_userLink");
	echo "<script>
			const IsLinkUser = " . ($isLinkUser ? "true" : "false") . ";
	</script>";

	function authenticateLink() {
		$_link = (string)$_GET["link"];
		if (!$_link || strlen($_link) > 100) return false;

		$linkId = "LINKUSER_" . sha1($_link);
		$GLOBALS["SESSION"]->set("veratio_userLink", $linkId);
		
		$GLOBALS["App"] = new _App();
		$projects = $GLOBALS["App"]->getAllProjects();
		if (sizeof($projects) > 0) return true;
		return false;
	}	
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb.tk</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>

		<link rel="stylesheet" type="text/css" href="css/component.css?a=52">
		<link rel="stylesheet" type="text/css" href="css/popup.css?a=39">
		<link rel="stylesheet" type="text/css" href="css/main.css?a=30">
		<link rel="stylesheet" type="text/css" href="css/sideBar.css?a=32">
		<link rel="stylesheet" type="text/css" href="css/mainContent/mainContent.css?a=60">
		<link rel="stylesheet" type="text/css" href="css/mainContent/taskHolder.css?a=75">
		<link rel="stylesheet" type="text/css" href="css/mainContent/header.css?a=1">

		<script type="text/javascript" src="/JS/jQuery.js" asy nc></script>
		<script type="text/javascript" src="/JS/request2.js" asy nc></script>
	</head>	
	<body class="appLoading">
		<div id="sideBar">
			<img class="sideBarBackground" src="images/sideBarBackground/?type=sidebar">
			<div class="navigationHolder">
				<div class="header clickable tab tabOpen" onclick="MainContent.taskPage.todayTab.open()">
					<img src="images/icons/todayIcon.png" class="headerIcon">
					<div class="headerText">Today</div>
				</div>
				<div class="header clickable tab" onclick="MainContent.taskPage.weekTab.open()">
					<img src="images/icons/weekIcon.png" class="headerIcon">
					<div class="headerText">This Week</div>
				</div>
			</div>
			<br>
			<div class="projectListHolder hide">
				<div class="header clickable tab" onclick="SideBar.projectList.toggleOpenState()">
					<img src="images/icons/dropDownIcon.png" class="headerIcon dropDownButton close dropTarget">
					<div class="headerText">Projects</div>
				</div>
				<div class="projectList hide">
					<div>
					</div>
					<div class="smallTextHolder tab projectTab clickable" onclick="Popup.createProjectMenu.open()"> 
						<a class="smallText smallTextIcon">+</a>
						<a class="smallText">Create project</a>
					</div>
				</div>
			</div>
			<div class="noConnectionMessage">
				<div class="header tab"> 
					<img src="images/icons/noConnectionIconLight.png" class="headerIcon">
					<div class="headerText">Lost connection</div>
				</div>
				<div class="text">
					? Unsaved changes <br>- Coming soon -
				</div>
			</div>
		</div>
		



		<div id="mainContent">
			<div id="mainContentHeader">
				<div class="header titleHolder userText"></div>

				<div class="functionHolder">
					<img src="images/icons/optionIcon.png" class="functionItem icon clickable" style="left: -5px">
					<div class="functionItem backButton clickable hide" onclick='MainContent.taskPage.reopenCurTab()'>
						<img src="images/icons/dropDownIconDark.png" class="functionItem icon">
						<a class="functionItem button text">
							Back
						</a>
					</div>
					<a class="clickable functionItem button bDefault" onclick='MainContent.settingsPage.open(MainContent.curProjectId)'>
						Share
					</a>
					<div class="functionItem memberList userText" onclick='MainContent.settingsPage.open(MainContent.curProjectId)'></div>
				</div>
			</div>

			<div id="mainContentHolder" class="renderFinishedTasks">

				<div class="mainContentPage doNotAlignLeft hi de">
					<div class="todoListHolder"></div>
				
					<div class='optionMenuHolder searchOption hide'></div>


					<div onclick="MainContent.taskPage.weekTab.loadMoreDays(3)" class="smallTextHolder clickable loadMoreButton">
						<a class="smallText smallTextIcon">+</a>
						<div class="titleHolder userText smallText">Load more</div>
					</div>
				</div>

				<div class="mainContentPage settingsPage hide">
					<br>
					<br>
					<div class="inviteMemberHolder">
						<a class="button bDefault bBoxy" onclick="Popup.inviteByEmailMenu.open()">
							<img src='images/icons/inviteIconLight.png'>
							Invite by email
						</a>
						<a class="button bDefault bBoxy" style="margin-left: 15px" onclick="MainContent.settingsPage.inviteUserByLink()">
							<img src='images/icons/linkIconLight.png'>
							Invite by link
						</a>
					</div>

					<div class="memberHolder"></div>

					<div class="HR" style="max-width: 650px; margin: auto"></div>
					<div class='text leaveButton clickable'onclick="MainContent.leaveCurrentProject()">
						<img src="images/icons/leaveIconRed.png">
						Leave project
					</div>
				</div>
			</div>
		</div>


		<script>
			// temporary so things don't get cached
			let antiCache = Math.round(Math.random() * 100000000);
			// Modules
			$.getScript("js/DOMData.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/time.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/UI.js?antiCache=" 										+ antiCache, function() {});
			$.getScript("js/color.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/textFormater.js?antiCache=" 							+ antiCache, function() {});

			$.getScript("js/constants.js?antiCache=" 								+ antiCache, function() {});
			$.getScript("js/extraFunctions.js?antiCache=" 							+ antiCache, function() {});
			$.getScript("js/optionMenu.js?antiCache=" 								+ antiCache, function() {});
			$.getScript("js/popup.js?antiCache=" 									+ antiCache, function() {});

			// Eventhandlers
			$.getScript("js/eventHandlers/dragHandler.js?antiCache=" 				+ antiCache, function() {});
			$.getScript("js/eventHandlers/keyHandler.js?antiCache=" 				+ antiCache, function() {});
			$.getScript("js/eventHandlers/doubleClickHandler.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/eventHandlers/rightClickHandler.js?antiCache=" 			+ antiCache, function() {});


			$.getScript("js/mainContent/header.js?antiCache=" 						+ antiCache, function() {});
			$.getScript("js/mainContent/pages.js?antiCache=" 						+ antiCache, function() {});
			
			$.getScript("js/mainContent/todoHolder/taskHolder.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/mainContent/todoHolder/renderer.js?antiCache=" 			+ antiCache, function() {});

			$.getScript("js/mainContent/mainContent.js?antiCache=" 					+ antiCache, function() {});


			$.getScript("js/sideBar.js?antiCache=" 									+ antiCache, function() {});
			

			$.getScript("js/server/project.js?antiCache=" 							+ antiCache, function() {});
			$.getScript("js/server/server.js?antiCache=" 							+ antiCache, function() {});


			$.getScript("js/app.js?antiCache=" 										+ antiCache, function() {});


			$.getScript("js/serviceWorker/indexedDB.js?antiCache=" 					+ antiCache, function() {});
		</script>


		<div class='UI box popup hide' id="optionMenu_colourPopupBox">
		</div>

	</body>
</html>	