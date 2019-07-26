
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
				height: 100vh;
				overflow: hidden;
			}

			.inviteMenu {
				position: relative;
				top: calc(50vh - 200px);
				margin: auto;


				width: calc(90vw - 40px * 2);
				max-width: 400px;

				padding: 40px;
				padding-bottom: 20px;
				background: #fff;

				border-radius: 3px;
				box-shadow: 5px 5px 15px 15px rgba(0, 0, 0, 0.01);
				transition: top 0.3s;
			}

			.inviteMenu.hide {
				top: 100vh;
			}


			#menu_linkNotFound.inviteMenu {
				padding-bottom: 40px;
				top: calc(-50vh + 200px);
			}
			#menu_linkNotFound.inviteMenu.hide {
				top: 100vh;
			}

			.text {
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

		<div class="inviteMenu hide" id="menu_linkFound">
			<div id="projectTitleHolder" class='text tHeaderLarge'></div>
			<br>
			<br>
			<div class='text'>
				You have been invited you to join 
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

			<div class="button bBoxy bDefault text">Join as member</div>
			<div class="button bBoxy text" style="font-size: 14px">Join as guest</div>
		</div>

		<div class="inviteMenu" id="menu_linkNotFound">
			<div class='text tHeaderLarge'>Oops, something went wrong</div>
			<br>
			<br>
			<div class='text highlight'>We couldn't find your invitation.</div>
			<div class='text'>
				Please ask your projects' owner to resend your invite.
			</div>
		</div>








		<script>
			function setTextToElement(element, text) {
				element.innerHTML = "";
				let a = document.createElement('a');
				a.text = text;
				element.append(a);
			}


			let rawInviteData = '<?php
				$root = realpath($_SERVER["DOCUMENT_ROOT"]);
				require_once "$root/git/todo/database/modules/app.php";

				$_inviteLink = (string)$_GET["id"];
				if (!$_inviteLink || strlen($_inviteLink) > 100) die("E_invalidLink");
				$_inviteLinkEnc = sha1($_inviteLink);
				$App = new _App($_inviteLinkEnc);
				
				$projects = $App->getAllProjects();
				if (sizeof($projects) == 0) die("E_invalidLink");
				$project = $projects[0];

				$user = $project->users->get($_inviteLinkEnc);
				if (!$user || $user["type"] != "invite") die("E_invalidLink");

				$returnData = array(
					"projectTitle" 		=> urlencode($project->title),
					"inviteLink"		=> urlencode($_inviteLink),
				);

				echo json_encode($returnData);
			?>';
	
			if (rawInviteData != "E_invalidLink") setup();





			function setup() {
				let inviteData 		= JSON.parse(rawInviteData);

				let projectTitle 	= decodeURIComponent((inviteData.projectTitle + '').replace(/\+/g, '%20'));
				let inviteLink 		= decodeURIComponent((inviteData.inviteLink + '').replace(/\+/g, '%20'));

				menu_linkFound.classList.remove("hide");
				menu_linkNotFound.classList.add("hide");

				setTextToElement(projectTitleHolder, 		projectTitle);
				setTextToElement(projectTitleHolder_small, 	projectTitle);

				document.getElementsByClassName("button")[0].onclick = function() {
					window.location.replace("join.php?type=signedIn&link=" + inviteLink);
				}
				document.getElementsByClassName("button")[1].onclick = function() {
					window.location.replace("join.php?type=guest&link=" + inviteLink);
				}
			}

		</script>
	</body>
</html>	
