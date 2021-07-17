<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	$GLOBALS["PM"]->includePacket("USER", "1.1");

	require_once __DIR__ . "/project.php";
	require_once __DIR__ . "/OrderManager.php";


	if (!function_exists("APP_noAuthHandler")) 
	{
		function APP_noAuthHandler() {
			die('{"error":"E_noAuth","result":false}');
		}
	}

	

	class _App {
		public $userId 		= false;
		public $isLinkUser 	= false;

		public $ownerPermissions = 3;
		
		public function __construct() {
			if ($this->validateLinkUser()) return;

			$this->userId = (string)$GLOBALS["SESSION"]->get("userId");
			if (!$this->userId) {$this->throwNoAuthError(); return;}
			$this->userId = sha1($this->userId);
		}

		private function validateLinkUser() {
			$link = (string)$_POST['linkId'];
			if (!$link) $link = (string)$_GET['link'];
			if (!$link || !isset($link) || strlen($link) > 100) return false;

			$this->isLinkUser = true;
			$this->userId = sha1($link);;
			$projects = $this->getAllProjects();
			if (sizeof($projects) == 0)
			{
				$this->isLinkUser = false;
				$this->userId = false;
				return false;
			}
			return true;;
		}


		private function throwNoAuthError() {
			try {
				APP_noAuthHandler();
			}
			catch (Exception $_e) {
			}
		}

		public function getProject($_id) {
			if (!$this->userId) {$this->throwNoAuthError(); return false;}

			$project = new _Project($_id, $this);
			$projectError = $project->errorOnCreation;
			if ($projectError === true) return false;
			if ($projectError !== false) return $projectError;
			if ($this->isLinkUser && $project->users->get($this->userId)["type"] != "link") return "E_userTypeIsNotLink";

			return $project;
		}

		public function getAllProjects() {
			if (!$this->userId) {$this->throwNoAuthError(); return "E_noAuth";}

			$DBHelper = $GLOBALS["DBHelper"]->getDBInstance(null);
			$projectIds = $DBHelper->getAllProjectIds();
			$projects = array();
			
			for ($i = 0; $i < sizeof($projectIds); $i++)
			{
				$curProject = $this->getProject($projectIds[$i]);
				if (!$curProject || is_string($curProject)) continue;
				array_push($projects, $curProject); 
			}
			
			return $GLOBALS['OrderManager']->sortProjectList($projects, $this->userId);
		}


		public function createProject($_title) {
			if (!$this->userId) {$this->throwNoAuthError(); return "E_noAuth";}

			$DBHelper 			= $GLOBALS["DBHelper"]->getDBInstance(null);
			$projectId 			= $DBHelper->createProject($this->userId);
			if (!$projectId) 	return "E_projectNotCreated";
			
			$project 			= $this->getProject($projectId);
			if (!$project || is_string($project)) return "E_projectNotCreated";


			$user = $project->users->get($this->userId);
			$user["permissions"] = $this->ownerPermissions;
			$project->users->update($user);

			$titleChanged 		= $project->rename($_title);
			if (!$titleChanged) return "E_projectNotCreated";

			return $project->export();
		}
	}


	global $App;
	$App = new _App();
?>