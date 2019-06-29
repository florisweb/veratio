<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	
	require_once "$root/git/todo/database/modules/project.php";

	class _App {
		public $userId;
		
		public function __construct() {
			$this->userId = (string)$GLOBALS["SESSION"]->get("userId");
			if (!$this->userId) die("E_nonAuth");
		}


		public function getProject($_id) {
			$project = new _Project($_id);
			
			$projectError = $project->errorOnCreation;
			if ($projectError === true)  return false;
			if ($projectError !== false) return $projectError;

			return $project;
		}

		public function getAllProjects() {
			$DBHelper = new _databaseHelper(null);
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
			$DBHelper 			= new _databaseHelper(null);
			$projectId 			= $DBHelper->createProject($this->userId);
			if (!$projectId) 	return false;
			
			$project 			= $this->getProject($projectId);
			$titleChanged 		= $project->changeTitle($_title);
			if (!$titleChanged) return false;

			return $projectId;
		}


		public function removeProject($_id) {
			
		}
	}



	global $App;
	$App = new _App();
?>