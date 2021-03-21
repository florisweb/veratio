<?php
	$enableRedirect = false;
	function APP_noAuthHandler() {
		if (!$enableRedirect) return;
		header("Location: https://florisweb.tk/user/login.php?APIKey=veratioV1.3");
		die("E_noAuth");
	}

	require_once __DIR__ . "/database/modules/app.php";
	require_once __DIR__ . "/database/modules/garbageCollector/garbageCollector.php";
	$enableRedirect = true;


	$isLinkUser = authenticateLink();
	if ($isLinkUser == false) 
	{
		$GLOBALS["SESSION"]->clear("veratio_userLink");
		echo "<script>const LinkUser = {link: false}; </script>";
	} else {
		echo "<script>const LinkUser = {link: '" . (string)$_GET["link"] . "'}</script>";
	}


	function authenticateLink() {
		$_link = (string)$_GET["link"];
		if (!$_link || strlen($_link) > 100) return false;

		$linkId = sha1($_link);
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
 		<link rel="stylesheet" type="text/css" href="css/main_min.css">
		<script type="text/javascript" src="https://florisweb.tk/JS/jQuery.js" asy nc></script>
		<script type="text/javascript" src="https://florisweb.tk/JS/request2.js" asy nc></script>
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
					<div class="smallTextHolder tab projectTab clickable createProjectButton" onclick="Popup.createProjectMenu.open()"> 
						<a class="smallText smallTextIcon">+</a>
						<a class="smallText">Create project</a>
					</div>
				</div>
			</div>
			<div class="noConnectionMessage">
				<div class="header tab"> 
					<img src="images/icons/noConnectionIconLight.png" class="headerIcon">
					<div class="headerText">Offline mode</div>
				</div>
				<div class="text"></div>
			</div>
			<div class='messageHolder popupHolder'></div>
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

			<div id="mainContentHolder">

				<div class="mainContentPage doNotAlignLeft">
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


		<div class='UI box popup hide' id="optionMenu_colourPopupBox">
		</div>
		
		<script src='js/main_min.js?a=1'></script>
	</body>
</html>	