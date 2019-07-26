<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");

	require_once "$root/git/todo/database/modules/project.php";

	// backwards compatability
	$sessionName = session_name("user");
	session_set_cookie_params(60 * 60 * 24 * 365.25, '/', '.florisweb.tk', TRUE, FALSE);
	session_start();


	class _App {
		public $userId 		= false;
		public $isLinkUser 	= false;

		// App settings
		public $ownerPermissions = ["2", "22", "21", "2"]; // HAS TO HAVE SINGLE QUOTES AROUND IT OTHERWISE THE ESCAPED TEXT GETS LOST
		
		
		public function __construct($_customUserId = false) {
			$linkId = $GLOBALS["SESSION"]->get("veratio_userLink");
			if ($linkId) 
			{
				$this->userId 		= (string)$linkId;
				$this->isLinkUser 	= true;
				return;
			}

			$this->userId = (string)$GLOBALS["SESSION"]->get("userId");
			if (!$this->userId)
			{
				$this->userId = $_SESSION["userId"];
			}

			if ($this->userId || $_customUserId)
			{
				$this->userId = sha1($this->userId);

				if ($_customUserId) $this->userId = (string)$_customUserId;
			}
		}


		public function getProject($_id) {
			if (!$this->userId) return "E_nonAuth";

			$project = new _Project($_id);
			
			$projectError = $project->errorOnCreation;
			if ($projectError === true)  return false;
			if ($projectError !== false) return $projectError;

			return $project;
		}

		public function getAllProjects() {
			if (!$this->userId) return "E_nonAuth";

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
			if (!$this->userId) return "E_nonAuth";

			$DBHelper 			= new _databaseHelper(null);
			$projectId 			= $DBHelper->createProject($this->userId);
			if (!$projectId) 	return false;
			
			$project 			= $this->getProject($projectId);
			if (!$project || is_string($project)) return "E_projectNotCreated" . $project;


			$user = $project->users->get($this->userId);
			$user["permissions"] = json_encode($this->ownerPermissions);
			$project->users->update($user);

			$titleChanged 		= $project->changeTitle($_title);
			if (!$titleChanged) return false;

			return $projectId;
		}
	}


	global $App;
	$App = new _App();
?>