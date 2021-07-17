<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");
	$PM->includePacket("SESSION", "1.0");

	require_once __DIR__ . "/OrderManager.php";
	require_once __DIR__ . "/projectHelpers/userComponent.php";
	require_once __DIR__ . "/projectHelpers/taskComponent.php";
	require_once __DIR__ . "/projectHelpers/tagComponent.php";
	

	class _Project {
		public $title = "";
		public $id = "";
		
		public $users;
		public $tasks;

		private $DB;

		public $errorOnCreation = true;
		public $App;


		public function __construct($_projectId, $_App) {
			$this->id = (string)$_projectId;
			$this->App = $_App;
			
			$this->users = new _project_userComponent($this, $this->id);
			$this->tasks = new _project_taskComponent($this, $this->id);
			$this->tags  = new _project_tagComponent($this, $this->id);

			$this->DB 	 = $GLOBALS["DBHelper"]->getDBInstance($this->id);

			$projectData = $this->DB->getProjectData();
			if (!$projectData) return $this->errorOnCreation = "E_projectNotFound";

			if (!$this->users->Self) return $this->errorOnCreation = "E_userNotInProject";

			$this->title = $projectData["title"];
			$this->errorOnCreation = false;
		}


		public function moveToIndex($_index) {
			return $GLOBALS['OrderManager']->moveProjectToIndex($this->id, $_index, $GLOBALS['App']->userId);
		}

		public function rename($_newTitle = "Titleless") {
			$user = $this->users->Self;
			if (!$user) return "E_userNotInProject";

			if ((int)$user["permissions"] < 2) return "E_actionNotAllowed";

			return $this->DB->writeProjectData("title", (string)$_newTitle);
		}



		public function remove() {
			$user = $this->users->Self;
			if (!$user) return "E_userNotInProject";

			if ((int)$user["permissions"] < 3) return "E_actionNotAllowed";

			return $this->DB->removeProject();
		}

		public function export() {
			return array(
				"id" 	=> $this->id,
				"title" => urlencode($this->title),
				"users"	=> $this->users->getAll(),
				"tags"	=> $this->tags->getAll()
			);
		}
	}


?>