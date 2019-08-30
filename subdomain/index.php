<!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb.tk</title>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="https://florisweb.tk/git/todo/manifest.json">
		<link rel="shortcut icon" href="https://florisweb.tk/git/todo/images/pressSet/favicon.ico">
		<style>
			iframe {
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
			$link = "https://florisweb.tk/git/todo?link=" . urlencode((string)$_GET["link"]);;
			echo "<iframe src='" . $link . "'></iframe>";
		?>
	</body>
</html>	