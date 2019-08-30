<!DOCTYPE html>
<html>
	<head>
		<title>Veratio - Florisweb.tk</title>
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