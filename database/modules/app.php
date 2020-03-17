<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	$GLOBALS["PM"]->includePacket("USER", "1.1");

	require_once __DIR__ . "/project.php";


	if (!function_exists("APP_noAuthHandler")) 
	{
		function APP_noAuthHandler() {
			die("E_noAuth");
		}
	}

	

	class _App {
		public $userId 		= false;
		public $isLinkUser 	= false;

		public $ownerPermissions = ["2", "22", "21", "2"];
		
		public function __construct() {
			$linkId = $GLOBALS["SESSION"]->get("veratio_userLink");
			if ($linkId) 
			{
				$this->userId 		= (string)$linkId;
				$this->isLinkUser 	= true;
				return;
			}

			$this->userId = (string)$GLOBALS["SESSION"]->get("userId");

			if (!$this->userId) {$this->throwNoAuthError(); return;}
			$this->userId = sha1($this->userId);
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

			$project = new _Project($_id);
			
			$projectError = $project->errorOnCreation;
			if ($projectError === true)  return false;
			if ($projectError !== false) return $projectError;
			if ($this->isLinkUser && $project->users->get($this->userId)["type"] != "link") return "E_userIsNotOfTypeLink";

			return $project;
		}

		public function getAllProjects() {
			if (!$this->userId) {$this->throwNoAuthError(); return array();}

			$DBHelper = $GLOBALS["DBHelper"]->getDBInstance(null);
			$projectIds = $DBHelper->getAllProjectIds();
			$projects = array();
			
			for ($i = 0; $i < sizeof($projectIds); $i++)
			{
				$curProject = $this->getProject($projectIds[$i]);
				if (!$curProject || is_string($curProject)) continue;
				array_push($projects, $curProject); 
			}
			
			return $projects;
		}


		public function createProject($_title) {
			if (!$this->userId) {$this->throwNoAuthError(); return false;}

			$DBHelper 			= $GLOBALS["DBHelper"]->getDBInstance(null);
			$projectId 			= $DBHelper->createProject($this->userId);
			if (!$projectId) 	return false;
			
			$project 			= $this->getProject($projectId);
			if (!$project || is_string($project)) return "E_projectNotCreated" . $project;


			$user = $project->users->get($this->userId);
			$user["permissions"] = json_encode($this->ownerPermissions);
			$project->users->update($user);

			$titleChanged 		= $project->rename($_title);
			if (!$titleChanged) return false;

			return $projectId;
		}
	}


	global $App;
	$App = new _App();
?>