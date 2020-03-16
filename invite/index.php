<?php
	function APP_noAuthHandler() {} // ignore the noAuthHandler since we're currently inviting someone

	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";
	$userNeedsSignIn = !$GLOBALS["App"]->userId;

	
	$_inviteLink = (string)$_GET["id"];
	if (!$_inviteLink || strlen($_inviteLink) > 100) die("E_invalidLink");
	

	$_inviteLinkEnc = sha1($_inviteLink);
	$App->userId = (string)$_inviteLinkEnc;
	
	$projects = $App->getAllProjects();
	if (sizeof($projects) == 0) die("E_invalidLink");
	$project = $projects[0];

	$user = $project->users->get($_inviteLinkEnc);
	if (!$user || $user["type"] != "invite") die("E_invalidLink");



	$returnData = array(
		"projectTitle" 		=> urlencode($project->title),
		"inviteLink"		=> urlencode($_inviteLink),
		"userSignedIn"		=> !$userNeedsSignIn
	);

	echo "<script>let rawInviteData = '" . json_encode($returnData) . "';</script>";
?>

<!DOCTYPE html>
<html>
	<head>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="../manifest.json">
		<link rel="stylesheet" type="text/css" href="../css/component.css?a=34">
		<link rel="shortcut icon" href="https://florisweb.tk/git/todo/images/pressSet/favicon.ico">

		<style>
			body {
				margin: 0;
				padding: 0;
				height: 100vh;
				overflow: hidden;
				background: linear-gradient(to bottom right, rgb(221, 157, 255), rgb(154, 191, 240));
			}

			#backgroundImage {
				position: fixed;
				left: 0;
				top: 0;
				width: 100vw;
				height: auto;


				animation: backgroundImage_popIn 1s 1;
			    animation-delay: 0s;
			    animation-fill-mode: forwards;

			    animation: backgroundImage_passive 5s 10000;
			}

			@media (max-aspect-ratio: 7/4) {
			  #backgroundImage {
				width: auto;
				height: 100vh;
			  }
			}

			
			@keyframes backgroundImage_popIn {
			    0% {
			    	opacity: 0;
			    }
			   
			    100% {
			    	opacity: 1;
			    	transform: scale(1.1);
			    }
			}
			@keyframes backgroundImage_passive {
			    0% {
			    	opacity: .5;
			    }
			    
			    50% {
			    	opacity: 1;
			    	transform: scale(1.05);
			    }
			   
			    100% {
			    	opacity: .5;
			    }
			}







			#menuHolder {
				position: relative;
				margin: auto;
				width: 90vw;
				max-width: 480px;
				height: 100vh;
			}



			.inviteMenu {
				position: absolute;
				top: calc(50vh - 170px);

				width: calc(100% - 40px * 2);

				padding: 40px;
								
				background: #fff;
				border-radius: 3px;
				box-shadow: 5px 5px 15px 15px rgba(0, 0, 0, 0.01);
				
				transition: top 0.3s;

				animation: inviteMenu_popIn .7s 1;
			    animation-delay: .1s;

			    animation-fill-mode: forwards;
			}
		

			@keyframes inviteMenu_popIn {
			    0% {
			    	transform: scale(0);
			    	opacity: 0;
			    	margin-top: 20vh;
			    }

			    100% {
			    	margin-top: 0;
			    	opacity: 1;
			    	transform: scale(1);
			    }
			}
			

			#menu_linkFound {
				top: calc(50vh - 210px);
				padding-bottom: 20px;
			}

			body.userSignedIn #menu_linkFound {
				padding-bottom: 30px;
			}




			#menu_linkFound .joinAsMemberButton::after {
				content: "Join as member";
			}

			body.userSignedIn #menu_linkFound .joinAsMemberButton::after {
				content: "Continue";
			}



			#menu_linkFound .joinAsGuestButton::after {
				content: "Join by link";
			}

			#menu_linkFound .joinAsGuestButton {
				font-size: 14px; 
			}

			body.userSignedIn #menu_linkFound .joinAsGuestButton {
				display: none;
			}







			.inviteMenu.hide {
				top: 100vh !important;
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


			#logo { 
				position: relative;
				top: 40px;
				left: calc(50vw - 90px / 2);
				width: 90px;				
				opacity: 0.8;
			}
		</style>		
		<title>Join Project - Veratio</title>
	</head>	
	<body>
		
		<img src="../images/sideBarBackground/backgrounds/fullScreen.jpg" id="backgroundImage">
		<img src="../images/pressSet/banner.png" id="logo">


		<div id="menuHolder">
			
			<div class="inviteMenu hide" id="menu_linkFound">
				<div id="projectTitleHolder" class='text tHeaderLarge'></div>
				<br>
				<br>
				<div class='text'>
					You have been invited to join 
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

				<div class="button bBoxy bDefault text joinAsMemberButton"></div>
				<div class="button bBoxy text joinAsGuestButton"></div>
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
		</div>






		<script>
			function setTextToElement(element, text) {
				element.innerHTML = "";
				let a = document.createElement('a');
				a.text = text;
				element.append(a);
			}

	
			if (rawInviteData != "E_invalidLink") setup();



			function setup() {
				let inviteData 		= JSON.parse(rawInviteData);

				let projectTitle 	= decodeURIComponent((inviteData.projectTitle + '').replace(/\+/g, '%20'));
				let inviteLink 		= decodeURIComponent((inviteData.inviteLink + '').replace(/\+/g, '%20'));

				menu_linkFound.classList.remove("hide");
				menu_linkNotFound.classList.add("hide");

				document.title = "Join " + projectTitle.substr(0, 20) + " - Veratio";
				setTextToElement(projectTitleHolder, 		projectTitle);
				setTextToElement(projectTitleHolder_small, 	projectTitle);

				let memberButton = document.getElementsByClassName("button")[0];
				memberButton.onclick = function() {
					window.location.replace("join.php?type=signedIn&link=" + inviteLink);
				}

				if (inviteData.userSignedIn) return document.body.classList.add("userSignedIn");

				let guestButton = document.getElementsByClassName("button")[1];
				guestButton.onclick = function() {
					window.location.replace("join.php?type=guest&link=" + inviteLink);
				}
			}

		</script>
	</body>
</html>	
