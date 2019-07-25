<!DOCTYPE html>
<html>
	<head>
		<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' name='viewport'/>
		<meta name="theme-color" content="#636ad5">
		<link rel="manifest" href="manifest.json">

		
		<title>Veratio - Florisweb.tk</title>
	</head>	

	<body>

		<?php
			$root = realpath($_SERVER["DOCUMENT_ROOT"]);
			require_once "$root/git/todo/database/modules/app.php";


			$_inviteLink = (string)$_GET["id"];
			
			
		?>
		

	</body>
</html>	
