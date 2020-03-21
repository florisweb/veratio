<!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb.tk</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="https://florisweb.tk/git/veratio/manifest.json">
		<link rel="shortcut icon" href="https://florisweb.tk/git/veratio/images/pressSet/favicon.ico">
		<style>
			#mainContentFrame {
				position: fixed;
				left: 0;
				top: 0;
				width: 100vw;
				height: 100vh;
				border: 0;
			}
		</style>
	</head>	
	<body>
		<?php
			$link = "https://florisweb.tk/git/veratio?link=" . urlencode((string)$_GET["link"]);;
			echo "<iframe id='mainContentFrame' src='" . $link . "'></iframe>";
		?>

		<link rel="stylesheet" type="text/css" href="popup/popup.css">
		<script type="text/javascript" src="https://florisweb.tk/JS/jQuery.js"></script>
		<script type="text/javascript" src="popup/popup.js"></script>

		<script>
			document.body.onload = function() {
				mainContentFrame.focus();
				showAvailableMessages();
			}

			function showAvailableMessages() {
			    const curMessageIndex = 1;
			    let messageIndex = parseInt(localStorage.getItem("messageIndex"));
			    if (messageIndex >= curMessageIndex) return;
			    
			    localStorage.setItem("messageIndex", curMessageIndex);
			    Popup.newVersionMenu.open();  
			 }
		</script>
	</body>
</html>	