<!DOCTYPE html>
<html>
	<head>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<link rel="stylesheet" type="text/css" href="css/component.css?a=15">
		<link rel="stylesheet" type="text/css" href="css/popup.css?a=20">
		<link rel="stylesheet" type="text/css" href="css/main.css?a=14">
		<link rel="stylesheet" type="text/css" href="css/sideBar.css?a=16">
		<link rel="stylesheet" type="text/css" href="css/mainContent/mainContent.css?a=18">
		<link rel="stylesheet" type="text/css" href="css/mainContent/dayItem.css?a=17">

		<script type="text/javascript" src="/JS/jQuery.js" asy nc></script>
		<script type="text/javascript" src="/JS/request2.js" asy nc></script>
		<title>Todo - Florisweb.tk</title>
	</head>	
	

	<body>

		
		<div id="notificationBoxHolder" class="hide">
			<div id="notificationBox">
			</div>
		</div>


		<div id="sideBar">
			<img class="sideBarBackground" src="images/sideBarBackground/?type=sidebar">

			<div class="navigationHolder">
				<div class="header clickable" onclick="MainContent.menu.Main.page.open('Inbox')">
					<img src="images/icons/weekIcon.png" class="headerIcon">
					<div class="headerText">Inbox</div>
				</div>
				<div class="header clickable" onclick="MainContent.menu.Main.page.open('Today')">
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
					<div class="smallTextHolder clickable" onclick="MainContent.menu.open('CreateProject')"> 
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
					<a class="clickable functionItem button bDefault">Share</a>
					<div class="functionItem memberList userText"></div>
				</div>
			</div>

			<div id="mainContentHolder">
				
				<div class="mainContentMenu doNotAlignLeft">
					<div class="todoListHolder"></div>
					
					<div class='optionMenuHolder hide'>
						<div class='optionItem clickable'>
							<img class='optionIcon' src='images/icons/removeIcon.png'>
							<div class='optionText'>Remove todo</div>
						</div>
						<div class='optionItem clickable'>
							<div class='optionText'>Edit todo</div>
						</div>
						<div class='optionItem clickable'>
							<img class='optionIcon' src='images/icons/weekIcon.png'>
							<div class='header userText optionText'>Postpone</div> 
						</div>
					</div>


					<div class='optionMenuHolder searchOption hide'>
					</div>

					<div onclick="MainContent.menu.Main.todoHolder.loadMoreDays(3)" class="smallTextHolder clickable loadMoreButton">
						<a class="smallText smallTextIcon">+</a>
						<div class="titleHolder userText smallText">Load more</div>
					</div>
				</div>



				<div class="mainContentMenu hide createProjectPage">
					<div class="createProjectHolder">
						<div class="text tHeaderMedium">Create a project</div>
						<br>

						<input placeholder="Your projects title" class="inputField iBoxy text">
						<a class="button bDefault bBoxy" onclick='MainContent.menu.CreateProject.createProject()'>Create</a>
					</div>
				</div>
			</div>
		</div>





		<script>
			// temporary so things don't get cached
			let antiCache = Math.round(Math.random() * 100000000);
			$.getScript("js/popup.js?antiCache=" 									+ antiCache, function() {});
			
			$.getScript("js/DOMData.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/time.js?antiCache=" 									+ antiCache, function() {});
			$.getScript("js/extraFunctions.js?antiCache=" 							+ antiCache, function() {});

			$.getScript("js/eventHandlers/keyHandler.js?antiCache=" 				+ antiCache, function() {});
			$.getScript("js/eventHandlers/doubleClickHandler.js?antiCache=" 		+ antiCache, function() {});
			$.getScript("js/eventHandlers/rightClickHandler.js?antiCache=" 			+ antiCache, function() {});


			$.getScript("js/mainContent/header/header.js?antiCache=" 				+ antiCache, function() {});
			


			$.getScript("js/mainContent/navigator.js?antiCache=" 					+ antiCache, function() {});
			
			$.getScript("js/mainContent/todoHolder/dayItem.js?antiCache=" 			+ antiCache, function() {});
			$.getScript("js/mainContent/todoHolder/renderSettings.js?antiCache=" 	+ antiCache, function() {});
			$.getScript("js/mainContent/todoHolder/renderer.js?antiCache=" 			+ antiCache, function() {});
			$.getScript("js/mainContent/todoHolder/todoHolder.js?antiCache=" 		+ antiCache, function() {});

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
 		<script type="text/javascript" src="js/mainContent/navigator.js" asy nc></script>

		<script type="text/javascript" src="js/mainContent/todoHolder/dayItem.js" asy nc></script>
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

		<script type="text/javascript" src="js/app.js" asy nc></script>
 -->



	</body>
</html>	
