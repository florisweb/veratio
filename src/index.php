<?php
	$enableRedirect = false;
	function APP_noAuthHandler() {
		if (!$enableRedirect) return;
		header("Location: " . $GLOBALS['UserDomainUrl'] . '/login?redirect=' . $GLOBALS['ProjectUrls']['veratioDev']);
		die("E_noAuth");
	}

	require_once __DIR__ . "/database/modules/app.php";
	$PM->includePacket('GLOBALS', '1.0');
	$enableRedirect = true;
?><!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover'  name='viewport'/>
 		<link rel="manifest" href="manifest.json">
 		<link rel="stylesheet" type="text/css" href="main_min.css">
	</head>	
	<body class="appLoading">
		<?php
			if ($GLOBALS['App']->isLinkUser)
			{
				echo "<script>const LinkUser = {link: '" . (string)$_GET["link"] . "'}</script>";
			} else {
				echo "<script>const LinkUser = {link: false}</script>";
			}
			
			echo "<script>" . 
				"const SignInUrl = '" . $GLOBALS['UserDomainUrl'] . '/login?redirect=' . $GLOBALS['ProjectUrls']['veratioDev'] . "';" . 
			"</script>";
		?>


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
				<div class="header clickable tab" onclick="MainContent.plannerPage.open()">
					<img src="images/icons/plannerIcon.png" class="headerIcon">
					<div class="headerText">Planner</div>
				</div>
			</div>
			<div class="projectListHolder hide">
				<div class="header clickable tab" onclick="SideBar.projectList.toggleOpenState()">
					<img src="images/icons/dropDownIcon.png" class="headerIcon dropDownButton close">
					<div class="headerText">Projects</div>
					<img src="images/loading.gif" class="icon loadingIcon hide">
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
			<div id="mainContentHeader" onclick="document.body.classList.remove('showSideBar');">
				<img src="images/icons/todayIconDark.png" class="titleIcon icon">
				<div class="header titleHolder userText"></div>

				<div class="functionHolder">
					<img src="images/icons/optionIcon.png" class="functionItem icon clickable" style="left: -5px">
					<div class="functionItem backButton clickable hide" onclick='MainContent.taskPage.reopenCurTab()'>
						<img src="images/icons/dropDownIconDark.png" class="functionItem icon">
						<a class="functionItem button text">
							Back
						</a>
					</div>
					<a class="clickable functionItem button bDefault" onclick='MainContent.settingsPage.open(MainContent.curProject)'>
						Share
					</a>
					<div class="functionItem memberList userText" onclick='MainContent.settingsPage.open(MainContent.curProject)'></div>
				</div>
			</div>

			<div id="mainContentHolder" onclick="document.body.classList.remove('showSideBar');">

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

				<div class="mainContentPage doNotAlignLeft plannerPage hide">
					<br>
					<br>
					<div class='text' style='text-align: center;'>Work in progress...</div>
				</div>
			</div>
		</div>

		<div id="mainContentFooter" class='phoneOnly'>
			<div class='pageButtonHolder'>
				<!-- TODO images to dark variant? -->
				<div class="pageButton clickable tab tabOpen" onclick="MainContent.taskPage.todayTab.open()">
					<img src="images/icons/todayIcon.png" class="buttonIcon">
				</div>
				<div class="pageButton clickable tab" onclick="MainContent.taskPage.weekTab.open()">
					<img src="images/icons/weekIcon.png" class="buttonIcon">
				</div>
				<div class="pageButton clickable tab" onclick="MainContent.plannerPage.open()">
					<img src="images/icons/plannerIcon.png" class="buttonIcon">
				</div>
				<div class="pageButton clickable tab" onclick="document.body.classList.add('showSideBar')">
					<img src="images/icons/projectIcon.png" class="buttonIcon">
				</div>
			</div>
		</div>


		<div class='UI box popup hide' id="optionMenu_colourPopupBox">
		</div>
		
		<script src='main_min.js'></script>
	</body>
</html>	