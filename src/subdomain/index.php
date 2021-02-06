<!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb.tk</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="manifest.json">
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
			$link = "https://florisweb.tk/git/veratioDev/src?link=" . urlencode((string)$_GET["link"]);;
			// $link = "../?link=" . urlencode((string)$_GET["link"]);;
			echo "<iframe id='mainContentFrame' src='" . $link . "'></iframe>";
		?>
		<script>
			document.body.onload = function() {
				mainContentFrame.focus();
			}

		</script>
	</body>
</html>	