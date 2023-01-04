<?php
	define('E_NO_AUTH', 				'E_NO_AUTH');
	define('E_PROJECT_NOT_FOUND', 		'E_PROJECT_NOT_FOUND');
	define('E_USER_NOT_IN_PROJECT', 	'E_USER_NOT_IN_PROJECT');
	define('E_ACTION_NOT_ALLOWED', 		'E_ACTION_NOT_ALLOWED');
	define('E_INTERNAL', 				'E_INTERNAL');
	define('E_INVALID_PARAMETERS', 		'E_INVALID_PARAMETERS');
	$Errors = [E_NO_AUTH, E_PROJECT_NOT_FOUND, E_USER_NOT_IN_PROJECT, E_ACTION_NOT_ALLOWED, E_INTERNAL, E_INVALID_PARAMETERS];
	global $Errors;

	function createErrorResponse($_error) {
		return json_encode(array(
			"result" => false,
			"error" => $_error
		));
	}
	function createResultResponse($_result) {
		return json_encode(array(
			"result" => $_result,
			"error" => false
		));
	}

	function createResponse($_resultOrError) {
		if (isError($_resultOrError)) return createErrorResponse($_resultOrError);
		return createResultResponse($_resultOrError);
	}

	function isError($_error) {
		return in_array($_error, $GLOBALS['Errors']);
	}
?>