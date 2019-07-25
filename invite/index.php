
<!DOCTYPE html>
<html>
	<head>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="../manifest.json">
		<link rel="stylesheet" type="text/css" href="../css/component.css?a=34">

		<style>
			body {
				margin: 0;
				padding: 0;
				background-image: url("../images/sideBarBackground/backgrounds/fullScreen.png");
			}

			#inviteMenu {
				position: relative;
				top: calc(50vh - 200px);
				margin: auto;


				width: calc(90vw - 40px * 2);
				max-width: 400px;
				height: auto;


				padding: 40px;
				padding-bottom: 20px;
				background: #fff;

				border-radius: 3px;
				box-shadow: 5px 5px 15px 15px rgba(0, 0, 0, 0.01);
			}

			.text {
				/*float: left;*/
				line-height: 25px;
			}
			.text.tHeaderLarge {
				color: #888;
			}

			.text.highlight {
				font-weight: bold;
			}


			.button {
				text-align: center;
			}
		</style>
		
		<title>Veratio - Florisweb.tk</title>
	</head>	

	<body>

		<div id="inviteMenu">
			<div id="projectTitleHolder" class='text tHeaderLarge'></div>
			<br>
			<br>
			<div class='text'>
				<a id="inviterNameHolder" class='text highlight'></a>
				has invited you to join 
				<a id="projectTitleHolder_small" class='text highlight'></a>.
			</div>
			
			<br>
			<br>
			<br>
			<div class='text' style="opacity: 0.7">
				By using 
				<a class='text highlight'>veratio</a>
				you agree to our  
				<a class='text highlight'>terms of service</a>.
			</div>
			<br>

			<div class="button bBoxy bDefault text">Continue</div>
			<div class="button bBoxy text" style="font-size: 12px">Join as guest</div>
		</div>















		<script>
			function setTextToElement(element, text) {
				element.innerHTML = "";
				let a = document.createElement('a');
				a.text = text;
				element.append(a);
			}

			let inviteData = JSON.parse('<?php
				try {
					$root = realpath($_SERVER["DOCUMENT_ROOT"]);
					require_once "$root/git/todo/database/modules/app.php";
				}
				catch (Exception $e) {}

				$_inviteLink = (string)$_GET["id"];
				if (!$_inviteLink || strlen($_inviteLink) > 50) die("E_invalidLink");
				$App = new _App($_inviteLink);
				
				$projects = $App->getAllProjects();
				if (sizeof($projects) == 0) die("E_projectNotFound");
				$project = $projects[0];

				$user = $project->users->get($_inviteLink);
				if (!$user || $user["type"] != "invite") die("E_userNotFound");
				

				$returnData = array(
					"inviterName" 		=> urlencode($user["name"]),
					"projectTitle" 		=> urlencode($project->title),
					"inviteLink"		=> urlencode($_inviteLink),
				);

				echo json_encode($returnData);
			?>');

			inviteData.projectTitle = decodeURIComponent((inviteData.projectTitle + '').replace(/\+/g, '%20'));
			inviteData.inviterName 	= decodeURIComponent((inviteData.inviterName + '').replace(/\+/g, '%20'));
			inviteData.inviteLink 	= decodeURIComponent((inviteData.inviteLink + '').replace(/\+/g, '%20'));

			inviteData.projectTitle = "NLT - melkwegstelsels";
			inviteData.inviterName = "floris@florisweb.tk";

			function setup() {
				setTextToElement(projectTitleHolder, 		inviteData.projectTitle);
				setTextToElement(projectTitleHolder_small, 	inviteData.projectTitle);
				setTextToElement(inviterNameHolder, 		inviteData.inviterName);

				document.getElementsByClassName("button")[0].onclick = function() {
					window.location.replace("join.php?type=signedIn&link=" + inviteData.inviteLink);
				}
				document.getElementsByClassName("button")[1].onclick = function() {
					window.location.replace("join.php?type=guest&link=" + inviteData.inviteLink);
				}
			}
			setup();

		</script>


	</body>
</html>	
