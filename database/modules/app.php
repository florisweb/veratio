<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	
	require_once "$root/git/todo/database/modules/project.php";

	class _App {
		public $userId;
		
		// App settings
		public $ownerPermissions = ["2", "22", "21", "2"]; // HAS TO HAVE SINGLE QUOTES AROUND IT OTHERWISE THE ESCAPED TEXT GETS LOST

		
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
			if (!$project || is_string($project)) return "E_projectNotCreated" . $project;


			$user = $project->users->get($this->userId);
			$user->permissions = json_encode($this->ownerPermissions);
			$project->users->update($user);

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