<?php
	setcookie("Veratio_hasSeenWelcomeMessage", "1", time() + 60 * 60 * 24 * 365, "/git/veratio");	
	
	$link = false;
	if (isset($_GET["link"])) $link = (string)$_GET["link"];
	echo "<script>const LINKUSER_LINK = decodeURIComponent('" . urlencode($link) . "');</script>";
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb.tk</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="manifest.json">
		<link rel="shortcut icon" href="../images/pressSet/favicon.ico">

		<link rel="stylesheet" type="text/css" href="../css/component.css?">
		<style>
			#backgroundImage {
				position: fixed;
				left: 0;
				top: 0;
				width: 100vw;
				height: 100vh;

				opacity: .2;
				animation: background_popIn 1s 1;
				transition: all .5s;
			}
			
			body.page1 #backgroundImage {
				opacity: .4;
				transform: scale(1.5);
			}


			#pageHolder {
				position: relative;
				margin: auto;
				width: 200px;
			}

			.page {
				position: absolute;
				
				top: calc(50vh - 100px);
				/*left: -10vh;*/
				transform: scale(0);
				
				width: 100%;
				height: auto;
				
				transition: all 0.3s;
				opacity: 0;
				pointer-events: none;
			}
			
			#page1.page {
				top: calc(50vh - 150px);
			}




			.page .logo {
				position: relative;
				left: calc(200px / 2 - 50px / 2);
				top: 25px;
				height: 50px;
				width: auto;
				opacity: 0;
				transform: scale(0);

				animation: logo_popIn 1s 1;
				animation-delay: .5s;
				animation-fill-mode: forwards;
			}

			.page .text.header {
				position: relative;
				top: 15px;
				width: 100%;
				text-align: center;
				opacity: 0;

				animation: logoText_show .5s 1;
				animation-delay: 1s;
				animation-fill-mode: forwards;
			}

			
			.page .button {
				position: relative;
				top: 50px;
				margin: auto;
				width: 50px;
				text-align: center;
				opacity: 0;

				animation: button_popIn .5s 1;
				animation-delay: 1.5s;
				animation-fill-mode: forwards;
			}

			@keyframes logo_popIn {
			    0% {
			    	opacity: 0;
			    	transform: scale(0);
			    }
			   
			    50% {
			    	opacity: .9;
			    	transform: scale(1);
			    	top: 25px;
			    }
			    100% {
			    	top: -30px;
			    	transform: scale(1);
			    	opacity: .9;
			    }
			}
			@keyframes button_popIn {
			    0% {
			    	opacity: 0;
			    	transform: scale(0);
			    }
			   
			    100% {
			    	opacity: .9;
			    	transform: scale(1);
			    }
			}
			@keyframes logoText_show {
			    0% {
			    	opacity: 0;
			    	top: -2 0px;
			    }
			   
			    100% {
			    	opacity: .5;
			    	top: 0px;
			    }
			}
			@keyframes background_popIn {
			    0% {
			    	opacity: 0;
			    }
			   
			    100% {
			    	opacity: .2;
			    }
			}


			#developmentLogo {
				opacity: 1;
				transform: scale(1);
				margin-bottom: 40px;
				
				-webkit-transform-origin: 100% 100%;
				animation: developmentLogo_hamer .5s infinite;
			}

			@keyframes developmentLogo_hamer {
			    0% {
			    	transform: rotate(45deg);
			    }

			    15% {
			    	transform: rotate(-45deg);
			    }
			   
			    100% {
			    	transform: rotate(45deg);
			    }
			}


			body.page0 #page0 {
				transform: scale(1);
				opacity: 1;
				pointer-events: all;
			}


			body.page1 #page1 {
				transform: scale(1);
				opacity: 1;
				pointer-events: all;
			}
			
	
		</style>
	</head>	
	<body class='page0'>
		<img src="../images/sideBarBackground/backgrounds/fullScreen.jpg" id="backgroundImage">
		
		<div id="pageHolder">
			<div id="page0" class="page">
				<img class="logo" src="../images/pressSet/favicon.ico">
				<div class="text header">Welcome to Veratio
					<br>
					<br>
					<a style="font-weight: normal !important">Ready to clear your head and organise your life?</a>
				</div>
				
				<div class="button bBoxy bDefault text clickable" onclick="document.body.className = 'page1'">Next</div>
			</div>

			<div id="page1" class="page">
				<img class="logo" src="../images/pressSet/developmentLogo.png" id="developmentLogo">
				<div class="text header">Development
					<br>
					<br>
					<a style="font-weight: normal !important">Veratio is under active development.<br>
						<a class="clickable" onclick="window.open('https://github.com/florisweb/veratio/commits/master')" style="text-decoration: underline; color: #999; font-weight: normal !important">View changelogs</a>
					</a>
				</div>
				
				<div class="button bBoxy bDefault text clickable" onclick="
					window.location.replace('../?link=' + LINKUSER_LINK);
				" style="width: 100px">Open Veratio</div>
			</div>
		</div>
	</body>
</html>	
