<!DOCTYPE html>
<html>
	<head>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<link rel="stylesheet" type="text/css" href="css/component.css?a=23">
		<link rel="stylesheet" type="text/css" href="css/popup.css?a=26">
		<link rel="stylesheet" type="text/css" href="css/main.css?a=21">
		<link rel="stylesheet" type="text/css" href="css/sideBar.css?a=22">
		<link rel="stylesheet" type="text/css" href="css/mainContent/mainContent.css?a=31">
		<link rel="stylesheet" type="text/css" href="css/mainContent/taskHolder.css?a=29">

		<script type="text/javascript" src="/JS/jQuery.js" asy nc></script>
		<script type="text/javascript" src="/JS/request2.js" asy nc></script>
		<title>Veratio - Florisweb.tk</title>
	</head>	
	

	<body>

		
		<div id="notificationBoxHolder" class="hide">
			<div id="notificationBox">
			</div>
		</div>


		<div id="sideBar">
			<img class="sideBarBackground" src="images/sideBarBackground/?type=sidebar">

			<div class="navigationHolder">
				<div class="header clickable" onclick="MainContent.taskPage.tab.open('Inbox')">
					<img src="images/icons/weekIcon.png" class="headerIcon">
					<div class="headerText">Inbox</div>
				</div>
				<div class="header clickable" onclick="MainContent.taskPage.tab.open('Today')">
					<img src="images/icons/todayIcon.png" class="headerIcon">
					<div class="headerText">Today</div>
				</div>
			</div>
			<br>
			<div class="projectListHolder hide">
				<div class="header clickable" onclick="SideBar.projectList.toggleOpenState()">
					<img src="images/icons/dropDown.png" class="headerIcon dropDownButton close">
					<div class="headerText">Projects</div>
				</div>
				<div class="projectList hide">
					<div>
					</div>
					<div class="smallTextHolder clickable" onclick="MainContent.createProjectPage.open()"> 
						<a class="smallText smallTextIcon">+</a>
						<a class="smallText">Create project</a>
					</div>
				</div>
				
				
			</div>
		</div>
		



		<div id="mainContent" class="animatePageChange">
			<div id="mainContentHeader">
				<div class="header titleHolder userText"></div>

				<div class="functionHolder">
					<img src="images/icons/optionIcon.png" class="functionItem icon clickable" style="left: -5px">
					<a class="clickable functionItem button bDefault" onclick='MainContent.memberPage.open(MainContent.curProjectId)'>Share</a>
					<div class="functionItem memberList userText"></div>
				</div>
			</div>

			<div id="mainContentHolder">

				<div class="mainContentPage doNotAlignLeft hi de">
					<div class="todoListHolder"></div>
				
					<div class='optionMenuHolder searchOption hide'></div>


					<div onclick="MainContent.taskPage.loadMoreDays(3)" class="smallTextHolder clickable loadMoreButton">
						<a class="smallText smallTextIcon">+</a>
						<div class="titleHolder userText smallText">Load more</div>
					</div>
				</div>



				<div class="mainContentPage hide createProjectPage">
					<div class="createProjectHolder">
						<div class="text tHeaderMedium">Create a project</div>
						<br>

						<input placeholder="Your projects title" class="inputField iBoxy text">
						<a class="button bDefault bBoxy" onclick='MainContent.createProjectPage.createProject()'>Create</a>
					</div>
				</div>

				<div class="mainContentPage memberPage hide">
					<div class="inviteMemberHolder">
						<input placeholder="Username or email" class="inputField iBoxy text">
						<a class="button bDefault bBoxy">Invite</a>
					</div>

					<div class="memberHolder"></div>
				</div>

			</div>
		</div>




		<script>
			// temporary so things don't get cached
			let antiCache = Math.round(Math.random() * 100000000);
			$.getScript("js/DOMData.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/time.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/extraFunctions.js?antiCache=" 							+ antiCache, function() {});
			
			$.getScript("js/popup.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/constants.js?antiCache=" 								+ antiCache, function() {});
			$.getScript("js/optionMenu.js?antiCache=" 								+ antiCache, function() {});
			

			$.getScript("js/eventHandlers/keyHandler.js?antiCache=" 				+ antiCache, function() {});
			$.getScript("js/eventHandlers/doubleClickHandler.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/eventHandlers/rightClickHandler.js?antiCache=" 			+ antiCache, function() {});


			$.getScript("js/mainContent/header/header.js?antiCache=" 				+ antiCache, function() {});
			


			$.getScript("js/mainContent/pages.js?antiCache=" 						+ antiCache, function() {});
			
			$.getScript("js/mainContent/todoHolder/taskHolder.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/mainContent/todoHolder/renderSettings.js?antiCache=" 	+ antiCache, function() {});
			$.getScript("js/mainContent/todoHolder/renderer.js?antiCache=" 			+ antiCache, function() {});

			$.getScript("js/mainContent/mainContent.js?antiCache=" 					+ antiCache, function() {});


			$.getScript("js/sideBar.js?antiCache=" 									+ antiCache, function() {});
			

			$.getScript("js/server/encoder.js?antiCache=" 							+ antiCache, function() {});
			$.getScript("js/server/projectHelpers/dataTypeTemplate.js?antiCache=" 	+ antiCache, function() {});
			$.getScript("js/server/projectHelpers/userComponent.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/server/projectHelpers/todoComponent.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/server/projectHelpers/tagComponent.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/server/project.js?antiCache=" 							+ antiCache, function() {});

			$.getScript("js/server/server.js?antiCache=" 							+ antiCache, function() {});


			$.getScript("js/app.js?antiCache=" 										+ antiCache, function() {});



		</script>
 	

<!-- 
		<script type="text/javascript" src="js/mainContent/todoHolder/taskHolder.js" asy nc></script>
		<script type="text/javascript" src="js/mainContent/todoHolder/renderSettings.js" asy nc></script>
		<script type="text/javascript" src="js/mainContent/todoHolder/renderer.js" asy nc></script>
		<script type="text/javascript" src="js/mainContent/todoHolder/todoHolder.js" asy nc></script>

		<script type="text/javascript" src="js/mainContent/mainContent.js" asy nc></script>

		<script type="text/javascript" src="js/sideBar.js" asy nc></script>


		<script type="text/javascript" src="js/server/projectHelpers/dataTypeTemplate.js" asy nc></script>
		<script type="text/javascript" src="js/server/projectHelpers/userComponent.js" asy nc></script>
		<script type="text/javascript" src="js/server/projectHelpers/todoComponent.js" asy nc></script>
		<script type="text/javascript" src="js/server/projectHelpers/tagComponent.js" asy nc></script>
		<script type="text/javascript" src="js/server/project.js" asy nc></script>

		<script type="text/javascript" src="js/server/server.js" asy nc></script>

		<script type="text/javascript" src="js/app.js" asy nc></script> -->




	</body>
</html>	
