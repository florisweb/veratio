<?php
	// Set the authentication cookie	
	if (isset($_GET["sessionKey"])) 
	{
		setcookie("SESSION_key", (String)$_GET["sessionKey"], time() + (60 * 60 * 24 * 365.25), "/");
	}
	header("Location: ./");
?>
